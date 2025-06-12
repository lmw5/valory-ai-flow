
-- Phase 1: Fix Critical Security Issues - Balance Deduction Logic

-- Create secure function to handle investment with balance deduction
CREATE OR REPLACE FUNCTION public.create_investment_with_balance_check(
  p_user_id UUID,
  p_plan_id TEXT,
  p_plan_name TEXT,
  p_investment_amount NUMERIC,
  p_daily_return NUMERIC,
  p_validity_days INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance NUMERIC;
  new_balance NUMERIC;
  investment_id UUID;
  result JSONB;
BEGIN
  -- Start transaction
  BEGIN
    -- Lock the user session to prevent concurrent modifications
    SELECT balance INTO current_balance
    FROM public.user_sessions
    WHERE user_id = p_user_id
    FOR UPDATE;
    
    -- Check if user exists
    IF current_balance IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'User session not found');
    END IF;
    
    -- Validate investment parameters
    IF NOT public.validate_investment_plan(p_investment_amount, p_daily_return, p_validity_days) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Invalid investment parameters');
    END IF;
    
    -- Check sufficient balance
    IF current_balance < p_investment_amount THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
    END IF;
    
    -- Calculate new balance
    new_balance := current_balance - p_investment_amount;
    
    -- Create the investment
    INSERT INTO public.user_investments (
      user_id, plan_id, plan_name, investment_amount, daily_return, validity_days
    ) VALUES (
      p_user_id, p_plan_id, p_plan_name, p_investment_amount, p_daily_return, p_validity_days
    ) RETURNING id INTO investment_id;
    
    -- Update user balance
    UPDATE public.user_sessions
    SET balance = new_balance, updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Log the transaction
    PERFORM public.log_audit_event(
      p_user_id,
      'INVESTMENT_CREATED',
      'user_investments',
      NULL,
      jsonb_build_object(
        'investment_id', investment_id,
        'amount', p_investment_amount,
        'balance_before', current_balance,
        'balance_after', new_balance
      )
    );
    
    RETURN jsonb_build_object(
      'success', true,
      'investment_id', investment_id,
      'new_balance', new_balance
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback on any error
    RAISE;
  END;
END;
$$;

-- Create function to validate balance updates with limits
CREATE OR REPLACE FUNCTION public.validate_balance_update(
  p_user_id UUID,
  p_new_balance NUMERIC,
  p_reason TEXT DEFAULT 'Manual update'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance NUMERIC;
  balance_change NUMERIC;
  recent_changes_count INTEGER;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance
  FROM public.user_sessions
  WHERE user_id = p_user_id;
  
  IF current_balance IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate change amount
  balance_change := ABS(p_new_balance - current_balance);
  
  -- Check for suspicious large changes (more than R$10,000)
  IF balance_change > 10000 THEN
    -- Log suspicious activity
    PERFORM public.log_audit_event(
      p_user_id,
      'SUSPICIOUS_BALANCE_CHANGE',
      'user_sessions',
      jsonb_build_object('old_balance', current_balance),
      jsonb_build_object('new_balance', p_new_balance, 'change', balance_change, 'reason', p_reason)
    );
    RETURN FALSE;
  END IF;
  
  -- Check for frequent balance changes (more than 10 in last hour)
  SELECT COUNT(*) INTO recent_changes_count
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND table_name = 'user_sessions'
    AND action = 'UPDATE'
    AND created_at >= NOW() - INTERVAL '1 hour';
  
  IF recent_changes_count > 10 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Update the session validation trigger to include the new validation
CREATE OR REPLACE FUNCTION public.validate_session_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate balance
  IF NOT public.validate_monetary_amount(NEW.balance, 0, 1000000) THEN
    RAISE EXCEPTION 'Invalid balance amount';
  END IF;
  
  -- Validate total_earned
  IF NOT public.validate_monetary_amount(NEW.total_earned, 0, 10000000) THEN
    RAISE EXCEPTION 'Invalid total earned amount';
  END IF;
  
  -- Validate connection_time (0-86400 seconds per day max)
  IF NEW.connection_time IS NULL OR NEW.connection_time < 0 OR NEW.connection_time > 86400 THEN
    RAISE EXCEPTION 'Invalid connection time';
  END IF;
  
  -- For UPDATE operations, validate the balance change
  IF TG_OP = 'UPDATE' AND OLD.balance != NEW.balance THEN
    IF NOT public.validate_balance_update(NEW.user_id, NEW.balance, 'System update') THEN
      RAISE EXCEPTION 'Suspicious balance change detected';
    END IF;
  END IF;
  
  -- Ensure total_earned is never less than current balance for new records
  IF TG_OP = 'INSERT' AND NEW.total_earned < NEW.balance THEN
    NEW.total_earned = NEW.balance;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create enhanced suspicious activity detection
CREATE OR REPLACE FUNCTION public.detect_suspicious_investment_activity(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  investment_count INTEGER;
  total_investment_today NUMERIC;
  balance_changes_count INTEGER;
  recent_login_count INTEGER;
BEGIN
  -- Check for excessive investments in the last 24 hours
  SELECT COUNT(*), COALESCE(SUM(investment_amount), 0)
  INTO investment_count, total_investment_today
  FROM public.user_investments
  WHERE user_id = p_user_id
    AND created_at >= NOW() - INTERVAL '24 hours';
  
  -- Check for excessive balance changes
  SELECT COUNT(*)
  INTO balance_changes_count
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND table_name = 'user_sessions'
    AND action = 'UPDATE'
    AND created_at >= NOW() - INTERVAL '24 hours';
  
  -- Check for multiple recent logins (possible account sharing)
  SELECT COUNT(*)
  INTO recent_login_count
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND action = 'LOGIN'
    AND created_at >= NOW() - INTERVAL '1 hour';
  
  -- Flag as suspicious if any threshold is exceeded
  IF investment_count > 10 
     OR total_investment_today > 50000 
     OR balance_changes_count > 20
     OR recent_login_count > 5 THEN
    
    -- Log the suspicious activity
    PERFORM public.log_audit_event(
      p_user_id,
      'SUSPICIOUS_ACTIVITY_DETECTED',
      'security_check',
      NULL,
      jsonb_build_object(
        'investment_count_24h', investment_count,
        'total_investment_24h', total_investment_today,
        'balance_changes_24h', balance_changes_count,
        'recent_logins_1h', recent_login_count
      )
    );
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Create function to handle secure earnings addition
CREATE OR REPLACE FUNCTION public.add_user_earnings(
  p_user_id UUID,
  p_amount NUMERIC,
  p_description TEXT,
  p_source TEXT DEFAULT 'task_completion'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance NUMERIC;
  current_total_earned NUMERIC;
  new_balance NUMERIC;
  new_total_earned NUMERIC;
BEGIN
  -- Validate amount
  IF NOT public.validate_monetary_amount(p_amount, 0.01, 1000) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid earnings amount');
  END IF;
  
  -- Lock the user session
  SELECT balance, total_earned 
  INTO current_balance, current_total_earned
  FROM public.user_sessions
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  IF current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User session not found');
  END IF;
  
  -- Calculate new values
  new_balance := current_balance + p_amount;
  new_total_earned := current_total_earned + p_amount;
  
  -- Update session
  UPDATE public.user_sessions
  SET balance = new_balance,
      total_earned = new_total_earned,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Add achievement record
  INSERT INTO public.user_achievements (
    user_id, achievement_type, achievement_name, description, value
  ) VALUES (
    p_user_id, p_source, 'Ganhos Adicionados', p_description, p_amount::integer
  );
  
  -- Log the transaction
  PERFORM public.log_audit_event(
    p_user_id,
    'EARNINGS_ADDED',
    'user_sessions',
    jsonb_build_object('balance', current_balance, 'total_earned', current_total_earned),
    jsonb_build_object('balance', new_balance, 'total_earned', new_total_earned, 'earnings_added', p_amount)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'new_balance', new_balance,
    'new_total_earned', new_total_earned
  );
END;
$$;
