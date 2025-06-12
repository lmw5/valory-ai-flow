
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
      // Fetch user investments
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
        setInvestments(investmentsData || []);
      }

      // Get investment summary using the new function
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
        setSummary({
          activePlans: data.active_plans || 0,
          dailyIncome: data.daily_income || 0,
          totalRevenue: data.total_revenue || 0,
          nextPaymentDate: data.next_payment_date || new Date(Date.now() + 86400000).toISOString().split('T')[0]
        });
      }

    } catch (error) {
      console.error('Error in fetchInvestments:', error);
      toast.error('Erro ao carregar dados de investimentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [user]);

  return {
    investments,
    summary,
    loading,
    refetch: fetchInvestments
  };
};
