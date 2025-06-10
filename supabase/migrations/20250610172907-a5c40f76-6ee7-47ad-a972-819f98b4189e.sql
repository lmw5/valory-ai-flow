
-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- RLS Policies for user_sessions table
CREATE POLICY "Users can view their own session" 
  ON public.user_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own session" 
  ON public.user_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for user_achievements table
CREATE POLICY "Users can view their own achievements" 
  ON public.user_achievements 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
  ON public.user_achievements 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create input validation function for text fields
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
  
  -- Check for basic XSS patterns (script tags, javascript:, on* events)
  IF input_text ~* '<script|javascript:|on\w+\s*=' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Create function to sanitize user input
CREATE OR REPLACE FUNCTION public.sanitize_user_input(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove potential XSS patterns and trim whitespace
  RETURN trim(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '<[^>]*>', '', 'g'), -- Remove HTML tags
        'javascript:', '', 'gi' -- Remove javascript: protocol
      ),
      'on\w+\s*=', '', 'gi' -- Remove event handlers
    )
  );
END;
$$;

-- Add triggers to validate and sanitize profile data
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate and sanitize name
  IF NOT public.validate_text_input(NEW.name, 100) THEN
    RAISE EXCEPTION 'Invalid name provided';
  END IF;
  NEW.name = public.sanitize_user_input(NEW.name);
  
  -- Validate email format
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_profile_before_insert_update
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_data();

-- Add trigger to validate achievement data
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
  
  -- Validate value is positive
  IF NEW.value < 0 THEN
    RAISE EXCEPTION 'Achievement value must be non-negative';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_achievement_before_insert_update
  BEFORE INSERT OR UPDATE ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_achievement_data();
