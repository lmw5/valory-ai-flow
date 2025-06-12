
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
