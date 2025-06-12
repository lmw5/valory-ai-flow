
-- Fix email validation function to be less restrictive
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate and sanitize name (more lenient)
  IF NEW.name IS NULL OR trim(NEW.name) = '' OR length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Invalid name provided';
  END IF;
  NEW.name = public.sanitize_user_input(NEW.name);
  
  -- More lenient email validation - basic format check
  IF NEW.email IS NULL OR NEW.email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix text input validation to be more lenient
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
  
  -- Less restrictive XSS check - only block obvious script tags
  IF input_text ~* '<script' THEN
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

-- Fix the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert profile with better error handling
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert session with better error handling
  INSERT INTO public.user_sessions (user_id, balance, total_earned)
  VALUES (NEW.id, 50.00, 50.00)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the signup
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$function$;
