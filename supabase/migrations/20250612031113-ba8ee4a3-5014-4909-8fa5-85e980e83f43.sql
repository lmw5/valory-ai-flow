
-- Melhorar a função de cálculo de lucros diários para ser mais eficiente e confiável
CREATE OR REPLACE FUNCTION public.calculate_daily_profits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    investment_record RECORD;
    days_since_start INTEGER;
    profit_amount NUMERIC;
    users_updated INTEGER := 0;
    total_profits_distributed NUMERIC := 0;
BEGIN
    -- Loop através de todos os investimentos ativos
    FOR investment_record IN
        SELECT 
            ui.id as investment_id,
            ui.user_id,
            ui.daily_return,
            ui.start_date,
            ui.validity_days,
            ui.plan_name,
            ui.investment_amount
        FROM user_investments ui
        WHERE ui.start_date::date <= CURRENT_DATE
        AND (ui.start_date::date + INTERVAL '1 day' * ui.validity_days) > CURRENT_DATE
        ORDER BY ui.user_id, ui.created_at
    LOOP
        -- Calcular dias desde o início do investimento
        days_since_start := EXTRACT(DAY FROM (CURRENT_DATE - investment_record.start_date::date));
        
        -- Verificar se o investimento ainda é válido
        IF days_since_start >= 0 AND days_since_start < investment_record.validity_days THEN
            profit_amount := investment_record.daily_return;
            
            -- Verificar se já foi processado hoje para este investimento
            IF NOT EXISTS (
                SELECT 1 FROM user_achievements 
                WHERE user_id = investment_record.user_id 
                AND achievement_type = 'daily_profit'
                AND description LIKE '%' || investment_record.investment_id::text || '%'
                AND earned_at::date = CURRENT_DATE
            ) THEN
                -- Atualizar saldo e ganhos totais do usuário com bloqueio
                UPDATE user_sessions 
                SET 
                    balance = balance + profit_amount,
                    total_earned = total_earned + profit_amount,
                    updated_at = NOW()
                WHERE user_id = investment_record.user_id;
                
                -- Verificar se a atualização foi bem-sucedida
                IF FOUND THEN
                    -- Registrar o lucro diário como uma conquista
                    INSERT INTO user_achievements (
                        user_id,
                        achievement_type,
                        achievement_name,
                        description,
                        value
                    ) VALUES (
                        investment_record.user_id,
                        'daily_profit',
                        'Rendimento Diário - ' || investment_record.plan_name,
                        'Rendimento diário automático do plano ' || investment_record.plan_name || ' (ID: ' || investment_record.investment_id || ')',
                        profit_amount::integer
                    );
                    
                    -- Fazer log da transação
                    PERFORM public.log_audit_event(
                        investment_record.user_id,
                        'DAILY_PROFIT_ADDED',
                        'user_sessions',
                        NULL,
                        jsonb_build_object(
                            'investment_id', investment_record.investment_id,
                            'plan_name', investment_record.plan_name,
                            'daily_return', profit_amount,
                            'days_since_start', days_since_start,
                            'processed_date', CURRENT_DATE
                        )
                    );
                    
                    users_updated := users_updated + 1;
                    total_profits_distributed := total_profits_distributed + profit_amount;
                END IF;
            END IF;
        END IF;
    END LOOP;
    
    -- Log da execução completa
    PERFORM public.log_audit_event(
        NULL,
        'DAILY_PROFIT_CALCULATION_COMPLETED',
        'system',
        NULL,
        jsonb_build_object(
            'users_updated', users_updated,
            'total_profits_distributed', total_profits_distributed,
            'execution_date', CURRENT_DATE,
            'execution_time', NOW()
        )
    );
    
    RAISE NOTICE 'Daily profits calculated and distributed at %. Users updated: %, Total distributed: R$ %', 
                 NOW(), users_updated, total_profits_distributed;
END;
$$;

-- Criar função para obter resumo de rendimentos diários de um usuário
CREATE OR REPLACE FUNCTION public.get_user_daily_income_summary(p_user_id UUID)
RETURNS TABLE(
    active_plans INTEGER,
    daily_income NUMERIC,
    total_revenue NUMERIC,
    next_payment_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as active_plans,
        COALESCE(SUM(ui.daily_return), 0) as daily_income,
        COALESCE(SUM(
            ui.daily_return * LEAST(
                EXTRACT(DAY FROM (CURRENT_DATE - ui.start_date::date)) + 1,
                ui.validity_days
            )
        ), 0) as total_revenue,
        (CURRENT_DATE + INTERVAL '1 day')::DATE as next_payment_date
    FROM user_investments ui
    WHERE ui.user_id = p_user_id
    AND ui.start_date::date <= CURRENT_DATE
    AND (ui.start_date::date + INTERVAL '1 day' * ui.validity_days) > CURRENT_DATE;
END;
$$;

-- Criar função para obter histórico de rendimentos diários
CREATE OR REPLACE FUNCTION public.get_user_daily_profits_history(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    achievement_name TEXT,
    description TEXT,
    value INTEGER,
    earned_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.id,
        ua.achievement_name,
        ua.description,
        ua.value,
        ua.earned_at
    FROM user_achievements ua
    WHERE ua.user_id = p_user_id
    AND ua.achievement_type = 'daily_profit'
    ORDER BY ua.earned_at DESC
    LIMIT p_limit;
END;
$$;

-- Garantir que o job cron esteja configurado corretamente
SELECT cron.unschedule('daily-profit-calculation');

SELECT cron.schedule(
    'daily-profit-calculation',
    '0 0 * * *', -- Executar à meia-noite todos os dias
    $$
    SELECT public.calculate_daily_profits();
    $$
);
