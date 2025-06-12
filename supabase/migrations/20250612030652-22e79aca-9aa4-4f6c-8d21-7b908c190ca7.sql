
-- Fix the investment validation function to be more flexible
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
  -- Validate investment amount (min R$1, max R$100,000) - more flexible range
  IF NOT public.validate_monetary_amount(investment_amount, 1, 100000) THEN
    RETURN FALSE;
  END IF;
  
  -- Validate daily return (min R$0.01, max R$10,000) - much more flexible
  IF NOT public.validate_monetary_amount(daily_return, 0.01, 10000) THEN
    RETURN FALSE;
  END IF;
  
  -- Validate validity days (1-730 days) - extended to 2 years
  IF validity_days IS NULL OR validity_days < 1 OR validity_days > 730 THEN
    RETURN FALSE;
  END IF;
  
  -- Remove the restrictive daily return percentage check
  -- The previous check was too restrictive for investment plans
  -- Now allowing any daily return amount within the monetary limits
  
  RETURN TRUE;
END;
$$;

-- Update the enhanced investment validation function as well
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
    
    -- Validate investment parameters using the updated function
    IF NOT public.validate_investment_plan(p_investment_amount, p_daily_return, p_validity_days) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Invalid investment parameters');
    END IF;
    
    -- Check sufficient balance
    IF current_balance < p_investment_amount THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
    END IF;
    
    -- Check daily investment limit (increased to R$50,000)
    SELECT COALESCE(SUM(investment_amount), 0) INTO daily_investment_total
    FROM public.user_investments
    WHERE user_id = p_user_id
      AND created_at >= CURRENT_DATE;
    
    IF daily_investment_total + p_investment_amount > 50000 THEN
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
