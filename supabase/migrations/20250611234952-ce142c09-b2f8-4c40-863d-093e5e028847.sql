
-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to calculate and add daily profits to users
CREATE OR REPLACE FUNCTION public.calculate_daily_profits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    investment_record RECORD;
    days_since_start INTEGER;
    profit_amount NUMERIC;
BEGIN
    -- Loop through all active investments
    FOR investment_record IN
        SELECT 
            ui.user_id,
            ui.daily_return,
            ui.start_date,
            ui.validity_days,
            ui.plan_name
        FROM user_investments ui
        WHERE ui.start_date <= CURRENT_DATE
        AND ui.start_date + INTERVAL '1 day' * ui.validity_days >= CURRENT_DATE
    LOOP
        -- Calculate days since investment started
        days_since_start := EXTRACT(DAY FROM (CURRENT_DATE - investment_record.start_date::date));
        
        -- Only add profit if the investment is still valid
        IF days_since_start >= 0 AND days_since_start < investment_record.validity_days THEN
            profit_amount := investment_record.daily_return;
            
            -- Update user balance and total earned
            UPDATE user_sessions 
            SET 
                balance = balance + profit_amount,
                total_earned = total_earned + profit_amount,
                updated_at = NOW()
            WHERE user_id = investment_record.user_id;
            
            -- Log the daily profit as an achievement
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
                'Rendimento diário automático do plano ' || investment_record.plan_name,
                profit_amount::integer
            );
        END IF;
    END LOOP;
    
    -- Log the execution
    RAISE NOTICE 'Daily profits calculated and distributed at %', NOW();
END;
$$;

-- Create a cron job to run the daily profit calculation every day at midnight
SELECT cron.schedule(
    'daily-profit-calculation',
    '0 0 * * *', -- Run at midnight every day
    $$
    SELECT public.calculate_daily_profits();
    $$
);

-- Create function to manually trigger profit calculation (for testing)
CREATE OR REPLACE FUNCTION public.trigger_daily_profits()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM public.calculate_daily_profits();
    
    RETURN json_build_object(
        'success', true,
        'message', 'Daily profits calculated successfully',
        'timestamp', NOW()
    );
END;
$$;
