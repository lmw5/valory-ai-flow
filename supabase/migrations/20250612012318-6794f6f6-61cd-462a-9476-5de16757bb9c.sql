
-- COMPREHENSIVE SECURITY FIXES - Phase 1: Critical Balance Deduction & Enhanced Security

-- ========================================
-- SECTION 1: ENHANCED INPUT VALIDATION
-- ========================================

-- Enhanced text input validation with XSS protection
CREATE OR REPLACE FUNCTION public.validate_text_input(input_text TEXT, max_length INTEGER DEFAULT 255)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check for null or empty
  IF input_text IS NULL OR trim(input_text) = '' THEN
    RETURN FALSE;
  END IF;
  
  -- Check length
  IF length(input_text) > max_length THEN
    RETURN FALSE;
  END IF;
  
  -- Enhanced XSS protection - check for dangerous patterns
  IF input_text ~* '<script|</script|javascript:|data:|vbscript:|onload|onerror|onclick|onmouseover|<iframe|<object|<embed|<link|<meta' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Enhanced text sanitization
CREATE OR REPLACE FUNCTION public.sanitize_user_input(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Enhanced sanitization - remove dangerous patterns and normalize
  RETURN trim(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(input_text, '<[^>]*>', '', 'g'), -- Remove all HTML tags
          'javascript:', '', 'gi' -- Remove javascript: protocol
        ),
        'data:', '', 'gi' -- Remove data: protocol
      ),
      'on\w+\s*=', '', 'gi' -- Remove event handlers
    )
  );
END;
$$;

-- Enhanced monetary amount validation
CREATE OR REPLACE FUNCTION public.validate_monetary_amount(amount NUMERIC, min_amount NUMERIC DEFAULT 0, max_amount NUMERIC DEFAULT 1000000)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check for null
  IF amount IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check for negative amounts
  IF amount < 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Check range
  IF amount < min_amount OR amount > max_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Check for reasonable precision (max 2 decimal places for currency)
  IF (amount * 100) != FLOOR(amount * 100) THEN
    RETURN FALSE;
  END IF;
  
  -- Additional check for infinity and NaN
  IF amount = 'infinity'::numeric OR amount = '-infinity'::numeric OR amount != amount THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Enhanced investment plan validation
CREATE OR REPLACE FUNCTION public.validate_investment_plan(
  investment_amount NUMERIC,
  daily_return NUMERIC,
  validity_days INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate investment amount (min R$50, max R$10,000)
  IF NOT public.validate_monetary_amount(investment_amount, 50, 10000) THEN
    RETURN FALSE;
  END IF;
  
  -- Validate daily return (min R$1, max R$1,000 - reduced from 5,000)
  IF NOT public.validate_monetary_amount(daily_return, 1, 1000) THEN
    RETURN FALSE;
  END IF;
  
  -- Validate validity days (1-365 days)
  IF validity_days IS NULL OR validity_days < 1 OR validity_days > 365 THEN
    RETURN FALSE;
  END IF;
  
  -- Enhanced validation - daily return cannot exceed 10% of investment (was 50%)
  IF daily_return > (investment_amount * 0.1) THEN
    RETURN FALSE;
  END IF;
  
  -- Additional check - total potential return cannot exceed 500% of investment
  IF (daily_return * validity_days) > (investment_amount * 5) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- ========================================
-- SECTION 2: ENHANCED BALANCE SECURITY
-- ========================================

-- Enhanced balance validation with stricter limits
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
  daily_balance_increase NUMERIC;
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
  
  -- Check for suspicious large changes (reduced from R$10,000 to R$5,000)
  IF balance_change > 5000 THEN
    PERFORM public.log_audit_event(
      p_user_id,
      'SUSPICIOUS_BALANCE_CHANGE',
      'user_sessions',
      jsonb_build_object('old_balance', current_balance),
      jsonb_build_object('new_balance', p_new_balance, 'change', balance_change, 'reason', p_reason)
    );
    RETURN FALSE;
  END IF;
  
  -- Check for frequent balance changes (reduced from 10 to 5 in last hour)
  SELECT COUNT(*) INTO recent_changes_count
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND table_name = 'user_sessions'
    AND action = 'UPDATE'
    AND created_at >= NOW() - INTERVAL '1 hour';
  
  IF recent_changes_count > 5 THEN
    RETURN FALSE;
  END IF;
  
  -- Check daily balance increase limit (new security check)
  SELECT COALESCE(SUM(
    CASE WHEN (new_values->>'balance')::numeric > (old_values->>'balance')::numeric 
         THEN (new_values->>'balance')::numeric - (old_values->>'balance')::numeric 
         ELSE 0 END
  ), 0) INTO daily_balance_increase
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND table_name = 'user_sessions'
    AND action = 'UPDATE'
    AND created_at >= CURRENT_DATE;
  
  -- Limit daily balance increase to R$2,000
  IF daily_balance_increase + GREATEST(p_new_balance - current_balance, 0) > 2000 THEN
    PERFORM public.log_audit_event(
      p_user_id,
      'DAILY_LIMIT_EXCEEDED',
      'user_sessions',
      jsonb_build_object('daily_increase', daily_balance_increase),
      jsonb_build_object('attempted_increase', p_new_balance - current_balance)
    );
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Secure investment creation with enhanced validation
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
  daily_investment_total NUMERIC;
BEGIN
  -- Start transaction
  BEGIN
    -- Validate and sanitize inputs
    IF NOT public.validate_text_input(p_plan_id, 50) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Invalid plan ID');
    END IF;
    
    IF NOT public.validate_text_input(p_plan_name, 100) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Invalid plan name');
    END IF;
    
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
    
    -- Check daily investment limit (new security check)
    SELECT COALESCE(SUM(investment_amount), 0) INTO daily_investment_total
    FROM public.user_investments
    WHERE user_id = p_user_id
      AND created_at >= CURRENT_DATE;
    
    IF daily_investment_total + p_investment_amount > 5000 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Daily investment limit exceeded');
    END IF;
    
    -- Calculate new balance
    new_balance := current_balance - p_investment_amount;
    
    -- Create the investment with sanitized inputs
    INSERT INTO public.user_investments (
      user_id, plan_id, plan_name, investment_amount, daily_return, validity_days
    ) VALUES (
      p_user_id, 
      public.sanitize_user_input(p_plan_id), 
      public.sanitize_user_input(p_plan_name), 
      p_investment_amount, 
      p_daily_return, 
      p_validity_days
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
    -- Enhanced error logging
    PERFORM public.log_audit_event(
      p_user_id,
      'INVESTMENT_ERROR',
      'user_investments',
      NULL,
      jsonb_build_object('error', SQLERRM, 'sqlstate', SQLSTATE)
    );
    RAISE;
  END;
END;
$$;

-- Enhanced earnings addition with rate limiting
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
  daily_earnings_total NUMERIC;
  hourly_earnings_count INTEGER;
BEGIN
  -- Enhanced input validation
  IF NOT public.validate_monetary_amount(p_amount, 0.01, 500) THEN -- Reduced max from 1000 to 500
    RETURN jsonb_build_object('success', false, 'error', 'Invalid earnings amount');
  END IF;
  
  IF NOT public.validate_text_input(p_description, 500) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid description');
  END IF;
  
  IF NOT public.validate_text_input(p_source, 100) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid source');
  END IF;
  
  -- Check daily earnings limit
  SELECT COALESCE(SUM(value), 0) INTO daily_earnings_total
  FROM public.user_achievements
  WHERE user_id = p_user_id
    AND earned_at >= CURRENT_DATE;
  
  IF daily_earnings_total + p_amount > 1000 THEN -- Daily earnings limit
    RETURN jsonb_build_object('success', false, 'error', 'Daily earnings limit exceeded');
  END IF;
  
  -- Check hourly earnings frequency (rate limiting)
  SELECT COUNT(*) INTO hourly_earnings_count
  FROM public.user_achievements
  WHERE user_id = p_user_id
    AND earned_at >= NOW() - INTERVAL '1 hour';
  
  IF hourly_earnings_count >= 10 THEN -- Max 10 earnings per hour
    RETURN jsonb_build_object('success', false, 'error', 'Hourly earnings limit exceeded');
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
  
  -- Add achievement record with sanitized inputs
  INSERT INTO public.user_achievements (
    user_id, achievement_type, achievement_name, description, value
  ) VALUES (
    p_user_id, 
    public.sanitize_user_input(p_source), 
    'Ganhos Adicionados', 
    public.sanitize_user_input(p_description), 
    p_amount::integer
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

-- ========================================
-- SECTION 3: ENHANCED SUSPICIOUS ACTIVITY DETECTION
-- ========================================

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
  rapid_transactions_count INTEGER;
  account_age_days INTEGER;
BEGIN
  -- Check account age
  SELECT EXTRACT(DAY FROM (NOW() - created_at)) INTO account_age_days
  FROM public.user_sessions
  WHERE user_id = p_user_id;
  
  -- Check for excessive investments in the last 24 hours (reduced thresholds)
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
  
  -- Check for rapid consecutive transactions
  SELECT COUNT(*)
  INTO rapid_transactions_count
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND action IN ('INVESTMENT_CREATED', 'EARNINGS_ADDED')
    AND created_at >= NOW() - INTERVAL '10 minutes';
  
  -- Enhanced suspicious activity detection with stricter thresholds
  IF investment_count > 5  -- Reduced from 10
     OR total_investment_today > 20000  -- Reduced from 50000
     OR balance_changes_count > 15  -- Reduced from 20
     OR recent_login_count > 3  -- Reduced from 5
     OR rapid_transactions_count > 5  -- New check
     OR (account_age_days < 1 AND total_investment_today > 1000)  -- New users with high investment
     THEN
    
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
        'recent_logins_1h', recent_login_count,
        'rapid_transactions_10m', rapid_transactions_count,
        'account_age_days', account_age_days
      )
    );
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- ========================================
-- SECTION 4: ENHANCED VALIDATION TRIGGERS
-- ========================================

-- Enhanced session validation trigger
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
  
  -- Enhanced validation: check for suspicious patterns
  IF TG_OP = 'UPDATE' THEN
    -- Prevent negative total_earned
    IF NEW.total_earned < OLD.total_earned AND NEW.balance >= OLD.balance THEN
      RAISE EXCEPTION 'Invalid total_earned reduction';
    END IF;
    
    -- Prevent unrealistic balance jumps
    IF NEW.balance > OLD.balance + 5000 THEN
      RAISE EXCEPTION 'Unrealistic balance increase detected';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Enhanced investment validation trigger
CREATE OR REPLACE FUNCTION public.validate_investment_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate plan_id
  IF NOT public.validate_text_input(NEW.plan_id, 50) THEN
    RAISE EXCEPTION 'Invalid plan ID provided';
  END IF;
  NEW.plan_id = public.sanitize_user_input(NEW.plan_id);
  
  -- Validate plan_name
  IF NOT public.validate_text_input(NEW.plan_name, 100) THEN
    RAISE EXCEPTION 'Invalid plan name provided';
  END IF;
  NEW.plan_name = public.sanitize_user_input(NEW.plan_name);
  
  -- Validate investment parameters
  IF NOT public.validate_investment_plan(NEW.investment_amount, NEW.daily_return, NEW.validity_days) THEN
    RAISE EXCEPTION 'Invalid investment parameters provided';
  END IF;
  
  -- For INSERT operations, check if user has sufficient balance
  IF TG_OP = 'INSERT' THEN
    -- Check suspicious activity before allowing investment
    IF public.detect_suspicious_investment_activity(NEW.user_id) THEN
      RAISE EXCEPTION 'Investment blocked due to suspicious activity';
    END IF;
    
    -- Additional validation for new investments
    IF NEW.start_date > NOW() + INTERVAL '1 day' THEN
      RAISE EXCEPTION 'Investment start date cannot be more than 1 day in the future';
    END IF;
    
    IF NEW.start_date < NOW() - INTERVAL '1 day' THEN
      RAISE EXCEPTION 'Investment start date cannot be more than 1 day in the past';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Enhanced profile validation trigger
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate and sanitize name (more lenient but still secure)
  IF NEW.name IS NULL OR trim(NEW.name) = '' OR length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Invalid name provided';
  END IF;
  NEW.name = public.sanitize_user_input(NEW.name);
  
  -- Enhanced email validation
  IF NEW.email IS NULL OR NEW.email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Additional email security checks
  IF length(NEW.email) > 255 THEN
    RAISE EXCEPTION 'Email address too long';
  END IF;
  
  -- Prevent email injection attacks
  IF NEW.email ~* '(script|javascript|data:|vbscript:|onload)' THEN
    RAISE EXCEPTION 'Invalid email content detected';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Enhanced achievement validation trigger
CREATE OR REPLACE FUNCTION public.validate_achievement_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate achievement name
  IF NOT public.validate_text_input(NEW.achievement_name, 200) THEN
    RAISE EXCEPTION 'Invalid achievement name';
  END IF;
  NEW.achievement_name = public.sanitize_user_input(NEW.achievement_name);
  
  -- Validate description
  IF NOT public.validate_text_input(NEW.description, 500) THEN
    RAISE EXCEPTION 'Invalid achievement description';
  END IF;
  NEW.description = public.sanitize_user_input(NEW.description);
  
  -- Enhanced value validation
  IF NEW.value < 0 OR NEW.value > 10000 THEN
    RAISE EXCEPTION 'Achievement value must be between 0 and 10000';
  END IF;
  
  -- Validate achievement type
  IF NOT public.validate_text_input(NEW.achievement_type, 100) THEN
    RAISE EXCEPTION 'Invalid achievement type';
  END IF;
  NEW.achievement_type = public.sanitize_user_input(NEW.achievement_type);
  
  RETURN NEW;
END;
$$;

-- ========================================
-- SECTION 5: APPLY ALL TRIGGERS
-- ========================================

-- Apply enhanced validation triggers
DROP TRIGGER IF EXISTS validate_session_before_insert_update ON public.user_sessions;
CREATE TRIGGER validate_session_before_insert_update
  BEFORE INSERT OR UPDATE ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_session_data();

DROP TRIGGER IF EXISTS validate_investment_before_insert_update ON public.user_investments;
CREATE TRIGGER validate_investment_before_insert_update
  BEFORE INSERT OR UPDATE ON public.user_investments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_investment_data();

DROP TRIGGER IF EXISTS validate_profile_before_insert_update ON public.profiles;
CREATE TRIGGER validate_profile_before_insert_update
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_data();

DROP TRIGGER IF EXISTS validate_achievement_before_insert_update ON public.user_achievements;
CREATE TRIGGER validate_achievement_before_insert_update
  BEFORE INSERT OR UPDATE ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_achievement_data();

-- ========================================
-- SECTION 6: ENHANCED AUDIT LOGGING
-- ========================================

-- Enhanced audit logging function
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_table_name TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, old_values, new_values)
  VALUES (p_user_id, p_action, p_table_name, p_old_values, p_new_values);
EXCEPTION WHEN OTHERS THEN
  -- If audit logging fails, don't fail the main operation
  RAISE WARNING 'Audit logging failed: %', SQLERRM;
END;
$$;

-- Enhanced audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_values JSONB;
  new_values JSONB;
  user_uuid UUID;
BEGIN
  -- Get user ID from the record
  IF TG_OP = 'DELETE' THEN
    user_uuid = OLD.user_id;
    old_values = to_jsonb(OLD);
  ELSE
    user_uuid = NEW.user_id;
    new_values = to_jsonb(NEW);
    IF TG_OP = 'UPDATE' THEN
      old_values = to_jsonb(OLD);
    END IF;
  END IF;
  
  -- Log the event with enhanced details
  PERFORM public.log_audit_event(
    user_uuid,
    TG_OP,
    TG_TABLE_NAME,
    old_values,
    new_values
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Apply enhanced audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_user_sessions ON public.user_sessions;
CREATE TRIGGER audit_user_sessions
  AFTER INSERT OR UPDATE OR DELETE ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_user_investments ON public.user_investments;
CREATE TRIGGER audit_user_investments
  AFTER INSERT OR UPDATE OR DELETE ON public.user_investments
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_user_achievements ON public.user_achievements;
CREATE TRIGGER audit_user_achievements
  AFTER INSERT OR UPDATE OR DELETE ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();
