
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
