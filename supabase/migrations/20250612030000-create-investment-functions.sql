
-- Create function to check user balance safely and create investment with balance deduction
CREATE OR REPLACE FUNCTION public.create_investment_with_balance_check(
  p_user_id UUID,
  p_plan_id TEXT,
  p_plan_name TEXT,
  p_investment_amount NUMERIC,
  p_daily_return NUMERIC,
  p_validity_days INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance NUMERIC;
  new_balance NUMERIC;
  investment_id UUID;
  result JSON;
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
      RETURN json_build_object('success', false, 'error', 'User session not found');
    END IF;
    
    -- Validate investment parameters using existing function
    IF NOT public.validate_investment_plan(p_investment_amount, p_daily_return, p_validity_days) THEN
      RETURN json_build_object('success', false, 'error', 'Invalid investment parameters');
    END IF;
    
    -- Check sufficient balance
    IF current_balance < p_investment_amount THEN
      RETURN json_build_object('success', false, 'error', 'Insufficient balance');
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
      json_build_object(
        'investment_id', investment_id,
        'amount', p_investment_amount,
        'balance_before', current_balance,
        'balance_after', new_balance
      )::jsonb
    );
    
    RETURN json_build_object(
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

-- Create function to safely validate balance updates
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
      json_build_object('old_balance', current_balance)::jsonb,
      json_build_object('new_balance', p_new_balance, 'change', balance_change, 'reason', p_reason)::jsonb
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

-- Create function to add user earnings safely
CREATE OR REPLACE FUNCTION public.add_user_earnings(
  p_user_id UUID,
  p_amount NUMERIC,
  p_description TEXT,
  p_source TEXT DEFAULT 'task_completion'
)
RETURNS JSON
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
    RETURN json_build_object('success', false, 'error', 'Invalid earnings amount');
  END IF;
  
  -- Lock the user session
  SELECT balance, total_earned 
  INTO current_balance, current_total_earned
  FROM public.user_sessions
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  IF current_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User session not found');
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
    json_build_object('balance', current_balance, 'total_earned', current_total_earned)::jsonb,
    json_build_object('balance', new_balance, 'total_earned', new_total_earned, 'earnings_added', p_amount)::jsonb
  );
  
  RETURN json_build_object(
    'success', true,
    'new_balance', new_balance,
    'new_total_earned', new_total_earned
  );
END;
$$;
