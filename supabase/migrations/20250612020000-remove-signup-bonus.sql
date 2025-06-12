
-- Remove the R$50 signup bonus for new users
-- Update the handle_new_user function to start users with 0 balance
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
  
  -- Insert session without bonus - start with 0 balance
  INSERT INTO public.user_sessions (user_id, balance, total_earned)
  VALUES (NEW.id, 0.00, 0.00)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the signup
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$function$;
