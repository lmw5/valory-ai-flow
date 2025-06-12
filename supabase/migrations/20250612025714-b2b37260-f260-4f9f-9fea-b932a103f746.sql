
-- Drop existing triggers if they exist to avoid conflicts
DROP TRIGGER IF EXISTS validate_investment_data ON public.user_investments;
DROP TRIGGER IF EXISTS validate_achievement_data ON public.user_achievements; 
DROP TRIGGER IF EXISTS validate_session_data ON public.user_sessions;
DROP TRIGGER IF EXISTS validate_profile_data ON public.profiles;
DROP TRIGGER IF EXISTS audit_user_investments ON public.user_investments;
DROP TRIGGER IF EXISTS audit_user_sessions ON public.user_sessions;

-- Adicionar políticas RLS para a tabela user_investments (só se não existirem)
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;

-- Dropar políticas existentes se houver conflito
DROP POLICY IF EXISTS "Users can view their own investments" ON public.user_investments;
DROP POLICY IF EXISTS "Users can create their own investments" ON public.user_investments;
DROP POLICY IF EXISTS "Users can update their own investments" ON public.user_investments;
DROP POLICY IF EXISTS "Users can delete their own investments" ON public.user_investments;

-- Criar políticas RLS para user_investments
CREATE POLICY "Users can view their own investments" 
  ON public.user_investments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investments" 
  ON public.user_investments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments" 
  ON public.user_investments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments" 
  ON public.user_investments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Adicionar políticas RLS para a tabela user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Dropar políticas existentes se houver conflito
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "System can create achievements" ON public.user_achievements;

-- Criar políticas RLS para user_achievements
CREATE POLICY "Users can view their own achievements" 
  ON public.user_achievements 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements" 
  ON public.user_achievements 
  FOR INSERT 
  WITH CHECK (true);

-- Recriar todos os triggers de validação
CREATE TRIGGER validate_investment_data
  BEFORE INSERT OR UPDATE ON public.user_investments
  FOR EACH ROW EXECUTE FUNCTION public.validate_investment_data();

CREATE TRIGGER validate_achievement_data  
  BEFORE INSERT OR UPDATE ON public.user_achievements
  FOR EACH ROW EXECUTE FUNCTION public.validate_achievement_data();

CREATE TRIGGER validate_session_data
  BEFORE INSERT OR UPDATE ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION public.validate_session_data();

CREATE TRIGGER validate_profile_data
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_data();

-- Recriar triggers de auditoria
CREATE TRIGGER audit_user_investments
  AFTER INSERT OR UPDATE OR DELETE ON public.user_investments
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_user_sessions
  AFTER INSERT OR UPDATE OR DELETE ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Garantir que o cron job para cálculo de lucros diários esteja ativo
-- Remover job existente se houver
SELECT cron.unschedule('daily-profit-calculation');

-- Criar novo job
SELECT cron.schedule(
    'daily-profit-calculation',
    '0 0 * * *', -- Executar à meia-noite todos os dias
    $$
    SELECT public.calculate_daily_profits();
    $$
);
