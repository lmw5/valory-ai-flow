
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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

  const fetchDailyProfits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get daily profits history using the new function
      const { data: profitsData, error: profitsError } = await supabase
        .rpc('get_user_daily_profits_history', {
          p_user_id: user.id,
          p_limit: 10
        });

      if (profitsError) {
        console.error('Error fetching daily profits:', profitsError);
        toast.error('Erro ao carregar histórico de rendimentos');
        setDailyProfits([]);
      } else {
        setDailyProfits(profitsData || []);
      }

      // Calculate today's profits
      const today = new Date().toISOString().split('T')[0];
      const todaysData = (profitsData || []).filter(
        profit => profit.earned_at.startsWith(today)
      );
      
      const todaysTotal = todaysData.reduce((sum, profit) => sum + profit.value, 0);
      setTodaysProfits(todaysTotal);

    } catch (error) {
      console.error('Error in fetchDailyProfits:', error);
      toast.error('Erro ao carregar dados de rendimentos');
    } finally {
      setLoading(false);
    }
  };

  const triggerManualCalculation = async () => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    try {
      console.log('Triggering manual calculation...');
      const { data, error } = await supabase.rpc('trigger_daily_profits');
      
      if (error) {
        console.error('Error triggering manual calculation:', error);
        toast.error('Erro ao calcular rendimentos');
      } else {
        console.log('Manual calculation result:', data);
        toast.success('Rendimentos calculados com sucesso!');
        // Refresh the data
        await fetchDailyProfits();
      }
    } catch (error) {
      console.error('Error in triggerManualCalculation:', error);
      toast.error('Erro ao processar solicitação');
    }
  };

  useEffect(() => {
    fetchDailyProfits();
  }, [user]);

  return {
    dailyProfits,
    todaysProfits,
    loading,
    triggerManualCalculation,
    refetch: fetchDailyProfits
  };
};
