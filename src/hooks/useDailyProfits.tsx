
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DailyProfit {
  id: string;
  achievement_name: string;
  description: string;
  value: number;
  earned_at: string;
}

export const useDailyProfits = () => {
  const { user } = useAuth();
  const [dailyProfits, setDailyProfits] = useState<DailyProfit[]>([]);
  const [todaysProfits, setTodaysProfits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDailyProfits();
    } else {
      setDailyProfits([]);
      setTodaysProfits(0);
      setLoading(false);
    }
  }, [user]);

  const fetchDailyProfits = async () => {
    if (!user) return;

    try {
      // Fetch daily profit achievements
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .eq('achievement_type', 'daily_profit')
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Error fetching daily profits:', error);
        setDailyProfits([]);
        setTodaysProfits(0);
      } else {
        const profits = data || [];
        setDailyProfits(profits);

        // Calculate today's profits
        const today = new Date().toDateString();
        const todaysTotal = profits
          .filter(profit => new Date(profit.earned_at).toDateString() === today)
          .reduce((sum, profit) => sum + profit.value, 0);
        
        setTodaysProfits(todaysTotal);
      }
    } catch (error) {
      console.error('Error fetching daily profits:', error);
      setDailyProfits([]);
      setTodaysProfits(0);
    } finally {
      setLoading(false);
    }
  };

  const triggerManualCalculation = async () => {
    try {
      const { data, error } = await supabase.rpc('trigger_daily_profits');
      
      if (error) {
        console.error('Error triggering manual calculation:', error);
        return false;
      } else {
        console.log('Manual calculation triggered:', data);
        await fetchDailyProfits();
        return true;
      }
    } catch (error) {
      console.error('Error triggering manual calculation:', error);
      return false;
    }
  };

  return {
    dailyProfits,
    todaysProfits,
    loading,
    refetch: fetchDailyProfits,
    triggerManualCalculation
  };
};
