
-- Corrigir a função get_user_daily_income_summary para resolver o erro de EXTRACT
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
                EXTRACT(DAY FROM (CURRENT_DATE - ui.start_date::date))::INTEGER + 1,
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
