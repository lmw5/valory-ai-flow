
-- Garantir que TODAS as contas sejam criadas com saldo ZERO - sem exceções
-- Remover completamente qualquer vestígio do bônus de R$50

-- Atualizar todos os usuários existentes que ainda tenham o bônus de R$50 para saldo zero
UPDATE user_sessions 
SET balance = 0.00, total_earned = 0.00, updated_at = NOW()
WHERE balance = 50.00 OR total_earned = 50.00;

-- Reescrever completamente a função handle_new_user para garantir saldo ZERO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Inserir perfil com validação aprimorada
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    public.sanitize_user_input(COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário')),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- SEMPRE inserir sessão com saldo ZERO - sem bônus algum
  INSERT INTO public.user_sessions (user_id, balance, total_earned)
  VALUES (NEW.id, 0.00, 0.00)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Log da criação do usuário para auditoria confirmando saldo zero
  PERFORM public.log_audit_event(
    NEW.id,
    'USER_CREATED_ZERO_BALANCE_ENFORCED',
    'auth.users',
    NULL,
    jsonb_build_object(
      'user_id', NEW.id,
      'email', NEW.email,
      'initial_balance', 0.00,
      'initial_total_earned', 0.00,
      'policy_enforced', 'NO_SIGNUP_BONUS',
      'created_at', NEW.created_at
    )
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log de erro aprimorado mas não falha no signup
  PERFORM public.log_audit_event(
    NEW.id,
    'USER_CREATION_ERROR_ZERO_BALANCE',
    'auth.users',
    NULL,
    jsonb_build_object(
      'error', SQLERRM,
      'sqlstate', SQLSTATE,
      'user_id', NEW.id,
      'attempted_balance', 0.00
    )
  );
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$function$;

-- Garantir que os defaults da tabela sejam sempre 0.00
ALTER TABLE user_sessions ALTER COLUMN balance SET DEFAULT 0.00;
ALTER TABLE user_sessions ALTER COLUMN total_earned SET DEFAULT 0.00;

-- Criar função específica para garantir saldo zero em criação de conta
CREATE OR REPLACE FUNCTION public.enforce_zero_balance_on_signup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Verificar se há algum usuário com saldo inicial diferente de zero nas últimas 24h
  UPDATE user_sessions 
  SET balance = 0.00, total_earned = 0.00, updated_at = NOW()
  WHERE (balance > 0 OR total_earned > 0) 
    AND created_at >= NOW() - INTERVAL '24 hours';
    
  -- Log da operação de limpeza
  INSERT INTO audit_logs (action, table_name, new_values)
  VALUES (
    'ZERO_BALANCE_ENFORCEMENT', 
    'user_sessions', 
    jsonb_build_object('policy', 'all_new_users_start_with_zero_balance')
  );
END;
$function$;

-- Adicionar constraint para prevenir qualquer saldo inicial positivo não autorizado
ALTER TABLE user_sessions DROP CONSTRAINT IF EXISTS check_no_unauthorized_initial_balance;
ALTER TABLE user_sessions ADD CONSTRAINT check_no_unauthorized_initial_balance 
  CHECK (
    balance >= 0 AND 
    total_earned >= 0 AND
    -- Prevenir que novos usuários comecem com saldo alto suspeito
    (created_at < NOW() - INTERVAL '1 minute' OR balance <= 0)
  );

-- Remover qualquer trigger antigo que possa estar dando bônus
DROP TRIGGER IF EXISTS give_signup_bonus ON auth.users;
DROP FUNCTION IF EXISTS public.give_signup_bonus();

-- Garantir que o trigger atual esteja usando a função correta
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
