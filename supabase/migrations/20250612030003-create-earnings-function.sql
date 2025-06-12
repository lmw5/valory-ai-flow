
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
