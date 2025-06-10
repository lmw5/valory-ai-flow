
-- Update the user_sessions table to give new users a R$50 bonus
-- and ensure total_earned reflects this initial bonus
UPDATE user_sessions 
SET balance = 50.00, total_earned = 50.00 
WHERE balance = 0.00 AND total_earned = 0.00;

-- Update the handle_new_user function to give new users the R$50 bonus
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email
  );
  
  -- Give new users R$50 bonus in both balance and total_earned
  INSERT INTO public.user_sessions (user_id, balance, total_earned)
  VALUES (NEW.id, 50.00, 50.00);
  
  RETURN NEW;
END;
$function$
