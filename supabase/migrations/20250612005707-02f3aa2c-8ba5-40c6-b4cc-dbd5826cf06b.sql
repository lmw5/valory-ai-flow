
-- Phase 1: RLS Policy Cleanup and Authorization Enhancement

-- First, let's properly enable RLS on all tables and create comprehensive policies
-- Drop existing incomplete policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own session" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update their own session" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can view their own investments" ON public.user_investments;
DROP POLICY IF EXISTS "Users can create their own investments" ON public.user_investments;
DROP POLICY IF EXISTS "Users can update their own investments" ON public.user_investments;
DROP POLICY IF EXISTS "Users can delete their own investments" ON public.user_investments;

-- Create comprehensive RLS policies for profiles table
CREATE POLICY "authenticated_users_can_view_own_profile" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "authenticated_users_can_update_own_profile" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create comprehensive RLS policies for user_sessions table
CREATE POLICY "authenticated_users_can_view_own_session" 
  ON public.user_sessions 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "authenticated_users_can_update_own_session" 
  ON public.user_sessions 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create comprehensive RLS policies for user_achievements table
CREATE POLICY "authenticated_users_can_view_own_achievements" 
  ON public.user_achievements 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "authenticated_users_can_insert_own_achievements" 
  ON public.user_achievements 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_can_update_own_achievements" 
  ON public.user_achievements 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_can_delete_own_achievements" 
  ON public.user_achievements 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for user_investments table
CREATE POLICY "authenticated_users_can_view_own_investments" 
  ON public.user_investments 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "authenticated_users_can_create_own_investments" 
  ON public.user_investments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_can_update_own_investments" 
  ON public.user_investments 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_can_delete_own_investments" 
  ON public.user_investments 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Phase 2: Input Validation and Business Logic Security

-- Create enhanced validation function for monetary amounts
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
  
  RETURN TRUE;
END;
$$;

-- Create function to validate investment parameters
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
  
  -- Validate daily return (min R$1, max R$5,000)
  IF NOT public.validate_monetary_amount(daily_return, 1, 5000) THEN
    RETURN FALSE;
  END IF;
  
  -- Validate validity days (1-365 days)
  IF validity_days IS NULL OR validity_days < 1 OR validity_days > 365 THEN
    RETURN FALSE;
  END IF;
  
  -- Validate that daily return is not unreasonably high compared to investment
  -- Maximum 50% daily return to prevent obvious scam configurations
  IF daily_return > (investment_amount * 0.5) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Create function to check user balance safely
CREATE OR REPLACE FUNCTION public.check_user_balance(user_uuid UUID, required_amount NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance NUMERIC;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance
  FROM public.user_sessions
  WHERE user_id = user_uuid;
  
  -- Return false if user not found or insufficient balance
  IF current_balance IS NULL OR current_balance < required_amount THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Update investment validation trigger
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
    IF NOT public.check_user_balance(NEW.user_id, NEW.investment_amount) THEN
      RAISE EXCEPTION 'Insufficient balance for investment';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger for investment validation
DROP TRIGGER IF EXISTS validate_investment_before_insert_update ON public.user_investments;
CREATE TRIGGER validate_investment_before_insert_update
  BEFORE INSERT OR UPDATE ON public.user_investments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_investment_data();

-- Update session validation trigger
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
  
  -- Ensure total_earned is never less than current balance for new records
  IF TG_OP = 'INSERT' AND NEW.total_earned < NEW.balance THEN
    NEW.total_earned = NEW.balance;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger for session validation
DROP TRIGGER IF EXISTS validate_session_before_insert_update ON public.user_sessions;
CREATE TRIGGER validate_session_before_insert_update
  BEFORE INSERT OR UPDATE ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_session_data();

-- Phase 3: Audit and Monitoring

-- Create audit log table for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs (only admins should see all logs, users see their own)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_audit_logs" 
  ON public.audit_logs 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- Create audit function
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
END;
$$;

-- Create audit triggers for sensitive tables
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
  
  -- Log the event
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

-- Apply audit triggers to sensitive tables
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

-- Create function to detect suspicious activity
CREATE OR REPLACE FUNCTION public.detect_suspicious_investment_activity(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  investment_count INTEGER;
  total_investment_today NUMERIC;
BEGIN
  -- Check for excessive investments in the last 24 hours
  SELECT COUNT(*), COALESCE(SUM(investment_amount), 0)
  INTO investment_count, total_investment_today
  FROM public.user_investments
  WHERE user_id = p_user_id
    AND created_at >= NOW() - INTERVAL '24 hours';
  
  -- Flag as suspicious if more than 10 investments or more than R$50,000 in 24h
  IF investment_count > 10 OR total_investment_today > 50000 THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;
