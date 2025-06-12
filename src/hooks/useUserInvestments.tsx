
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Investment {
  id: string;
  plan_id: string;
  plan_name: string;
  investment_amount: number;
  daily_return: number;
  validity_days: number;
  start_date: string;
  created_at: string;
}

interface InvestmentSummary {
  activePlans: number;
  dailyIncome: number;
  totalRevenue: number;
  nextPaymentDate: string;
}

export const useUserInvestments = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<InvestmentSummary>({
    activePlans: 0,
    dailyIncome: 0,
    totalRevenue: 0,
    nextPaymentDate: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchInvestments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching investments for user:', user.id);
      
      // Fetch user investments with better error handling
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('user_investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (investmentsError) {
        console.error('Error fetching investments:', investmentsError);
        toast.error('Erro ao carregar investimentos');
        setInvestments([]);
      } else {
        console.log('Investments data:', investmentsData);
        setInvestments(investmentsData || []);
      }

      // Get investment summary using the database function
      console.log('Fetching investment summary...');
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_user_daily_income_summary', {
          p_user_id: user.id
        });

      if (summaryError) {
        console.error('Error fetching investment summary:', summaryError);
        toast.error('Erro ao carregar resumo de investimentos');
        setSummary({
          activePlans: 0,
          dailyIncome: 0,
          totalRevenue: 0,
          nextPaymentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
        });
      } else if (summaryData && summaryData.length > 0) {
        const data = summaryData[0];
        console.log('Summary data:', data);
        setSummary({
          activePlans: data.active_plans || 0,
          dailyIncome: parseFloat(data.daily_income) || 0,
          totalRevenue: parseFloat(data.total_revenue) || 0,
          nextPaymentDate: data.next_payment_date || new Date(Date.now() + 86400000).toISOString().split('T')[0]
        });
      } else {
        console.log('No summary data found, setting to zero');
        setSummary({
          activePlans: 0,
          dailyIncome: 0,
          totalRevenue: 0,
          nextPaymentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
        });
      }

    } catch (error) {
      console.error('Error in fetchInvestments:', error);
      toast.error('Erro ao carregar dados de investimentos');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscriptions for automatic updates
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscriptions for user:', user.id);

    // Subscribe to changes in user_investments table
    const investmentsChannel = supabase
      .channel('user-investments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_investments',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Investment change detected:', payload);
          // Refetch data when investments change
          fetchInvestments();
        }
      )
      .subscribe();

    // Subscribe to changes in user_achievements for daily profits
    const achievementsChannel = supabase
      .channel('user-achievements-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Achievement change detected:', payload);
          // Check if it's a daily profit achievement
          if (payload.new?.achievement_type === 'daily_profit') {
            console.log('Daily profit detected, refreshing data');
            // Refetch data when daily profits are added
            fetchInvestments();
          }
        }
      )
      .subscribe();

    // Subscribe to balance changes in user_sessions
    const sessionChannel = supabase
      .channel('user-session-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_sessions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Session balance change detected:', payload);
          // Refetch summary data when balance changes (could indicate daily profits)
          fetchInvestments();
        }
      )
      .subscribe();

    // Initial fetch
    fetchInvestments();

    // Cleanup subscriptions
    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(investmentsChannel);
      supabase.removeChannel(achievementsChannel);
      supabase.removeChannel(sessionChannel);
    };
  }, [user]);

  // Auto-refresh every 30 seconds to ensure data stays current
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing investment data...');
      fetchInvestments();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  return {
    investments,
    summary,
    loading,
    refetch: fetchInvestments
  };
};
