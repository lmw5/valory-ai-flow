
-- Ensure new users start with zero balance - remove all traces of R$50 bonus
-- Update all existing users who might have the R$50 bonus to start fresh
UPDATE user_sessions 
SET balance = 0.00, total_earned = 0.00 
WHERE balance = 50.00 AND total_earned = 50.00;

-- Completely rewrite the handle_new_user function to ensure zero balance
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
  
  -- Insert session with ZERO balance - no bonus whatsoever
  INSERT INTO public.user_sessions (user_id, balance, total_earned)
  VALUES (NEW.id, 0.00, 0.00)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Log the new user creation for audit purposes with zero balance confirmation
  PERFORM public.log_audit_event(
    NEW.id,
    'USER_CREATED_ZERO_BALANCE',
    'auth.users',
    NULL,
    jsonb_build_object(
      'user_id', NEW.id,
      'email', NEW.email,
      'initial_balance', 0.00,
      'initial_total_earned', 0.00,
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

-- Remove any default values that might be granting bonuses
ALTER TABLE user_sessions ALTER COLUMN balance SET DEFAULT 0.00;
ALTER TABLE user_sessions ALTER COLUMN total_earned SET DEFAULT 0.00;

-- Add a check to ensure no user can have negative balances but also no automatic bonuses
ALTER TABLE user_sessions ADD CONSTRAINT check_balance_non_negative CHECK (balance >= 0);
ALTER TABLE user_sessions ADD CONSTRAINT check_total_earned_non_negative CHECK (total_earned >= 0);
