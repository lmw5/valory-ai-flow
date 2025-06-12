
-- Enhanced Security Fixes - Email Validation and Missing Functions

-- Fix email validation function to be less restrictive but more secure
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Enhanced name validation with better sanitization
  IF NEW.name IS NULL OR trim(NEW.name) = '' OR length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Invalid name provided';
  END IF;
  NEW.name = public.sanitize_user_input(NEW.name);
  
  -- Enhanced email validation - more comprehensive format check
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

-- Enhanced text input validation to be more lenient while maintaining security
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
  
  -- Enhanced XSS protection - check for dangerous patterns but be less restrictive
  IF input_text ~* '<script|</script|javascript:|data:|vbscript:|onload|onerror|onclick' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Add missing RLS policies that were referenced but not created
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own session" 
  ON public.user_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Ensure all required RLS policies exist for audit logs
CREATE POLICY "users_can_view_own_audit_logs" 
  ON public.audit_logs 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- Enhanced handle_new_user function with better error handling and security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert profile with enhanced validation and error handling
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    public.sanitize_user_input(COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário')),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert session without bonus - start with 0 balance (security improvement)
  INSERT INTO public.user_sessions (user_id, balance, total_earned)
  VALUES (NEW.id, 0.00, 0.00)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Log the new user creation for audit purposes
  PERFORM public.log_audit_event(
    NEW.id,
    'USER_CREATED',
    'auth.users',
    NULL,
    jsonb_build_object(
      'user_id', NEW.id,
      'email', NEW.email,
      'created_at', NEW.created_at
    )
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Enhanced error logging but don't fail the signup
  PERFORM public.log_audit_event(
    NEW.id,
    'USER_CREATION_ERROR',
    'auth.users',
    NULL,
    jsonb_build_object(
      'error', SQLERRM,
      'sqlstate', SQLSTATE,
      'user_id', NEW.id
    )
  );
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$function$;

-- Create function to check and clean up orphaned data (security maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleaned_count INTEGER := 0;
BEGIN
  -- Clean up orphaned user sessions
  DELETE FROM public.user_sessions 
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  -- Clean up orphaned profiles
  DELETE FROM public.profiles 
  WHERE id NOT IN (SELECT id FROM auth.users);
  
  GET DIAGNOSTICS cleaned_count = cleaned_count + ROW_COUNT;
  
  -- Clean up orphaned investments
  DELETE FROM public.user_investments 
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  
  GET DIAGNOSTICS cleaned_count = cleaned_count + ROW_COUNT;
  
  -- Clean up orphaned achievements
  DELETE FROM public.user_achievements 
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  
  GET DIAGNOSTICS cleaned_count = cleaned_count + ROW_COUNT;
  
  -- Clean up old audit logs (keep only last 30 days for performance)
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS cleaned_count = cleaned_count + ROW_COUNT;
  
  RETURN cleaned_count;
END;
$$;

-- Create function to generate security reports
CREATE OR REPLACE FUNCTION public.generate_security_report(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  metric_name TEXT,
  metric_value NUMERIC,
  risk_level TEXT,
  description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH security_metrics AS (
    SELECT 
      'suspicious_activities' as metric_name,
      COUNT(*)::numeric as metric_value,
      CASE 
        WHEN COUNT(*) = 0 THEN 'LOW'
        WHEN COUNT(*) <= 5 THEN 'MEDIUM'
        ELSE 'HIGH'
      END as risk_level,
      'Number of suspicious activities detected in last 24h' as description
    FROM public.audit_logs
    WHERE action LIKE 'SUSPICIOUS%'
      AND created_at >= NOW() - INTERVAL '24 hours'
      AND (p_user_id IS NULL OR user_id = p_user_id)
    
    UNION ALL
    
    SELECT 
      'failed_validations',
      COUNT(*)::numeric,
      CASE 
        WHEN COUNT(*) = 0 THEN 'LOW'
        WHEN COUNT(*) <= 10 THEN 'MEDIUM'
        ELSE 'HIGH'
      END,
      'Number of validation failures in last 24h'
    FROM public.audit_logs
    WHERE action LIKE '%ERROR%'
      AND created_at >= NOW() - INTERVAL '24 hours'
      AND (p_user_id IS NULL OR user_id = p_user_id)
    
    UNION ALL
    
    SELECT 
      'large_transactions',
      COUNT(*)::numeric,
      CASE 
        WHEN COUNT(*) = 0 THEN 'LOW'
        WHEN COUNT(*) <= 3 THEN 'MEDIUM'
        ELSE 'HIGH'
      END,
      'Number of large financial transactions in last 24h'
    FROM public.audit_logs
    WHERE (new_values->>'balance')::numeric > 1000
      AND created_at >= NOW() - INTERVAL '24 hours'
      AND (p_user_id IS NULL OR user_id = p_user_id)
  )
  SELECT sm.metric_name, sm.metric_value, sm.risk_level, sm.description
  FROM security_metrics sm;
END;
$$;
