
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserInvestment {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  investment_amount: number;
  daily_return: number;
  validity_days: number;
  start_date: string;
  created_at: string;
  updated_at: string;
}

interface InvestmentSummary {
  activePlans: number;
  dailyIncome: number;
  totalRevenue: number;
}

export const useUserInvestments = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [summary, setSummary] = useState<InvestmentSummary>({
    activePlans: 0,
    dailyIncome: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserInvestments();
    } else {
      setInvestments([]);
      setSummary({ activePlans: 0, dailyIncome: 0, totalRevenue: 0 });
      setLoading(false);
    }
  }, [user]);

  const fetchUserInvestments = async () => {
    if (!user) return;

    try {
      // Query user_investments table with proper typing
      const { data, error } = await supabase
        .from('user_investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching investments:', error);
        setInvestments([]);
        setSummary({ activePlans: 0, dailyIncome: 0, totalRevenue: 0 });
      } else {
        const investmentData = data || [];
        setInvestments(investmentData);
        calculateSummary(investmentData);
      }
    } catch (error) {
      console.error('Error fetching investments:', error);
      setInvestments([]);
      setSummary({ activePlans: 0, dailyIncome: 0, totalRevenue: 0 });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (investmentList: UserInvestment[]) => {
    const today = new Date();
    
    let totalDailyIncome = 0;
    let totalRevenue = 0;
    let activePlansCount = 0;

    investmentList.forEach((investment) => {
      const startDate = new Date(investment.start_date);
      const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const validDays = Math.min(daysPassed, investment.validity_days);

      if (validDays >= 0 && daysPassed <= investment.validity_days) {
        activePlansCount++;
        totalDailyIncome += Number(investment.daily_return);
        totalRevenue += Number(investment.daily_return) * validDays;
      }
    });

    setSummary({
      activePlans: activePlansCount,
      dailyIncome: totalDailyIncome,
      totalRevenue: totalRevenue
    });
  };

  const addInvestment = async (planData: {
    plan_id: string;
    plan_name: string;
    investment_amount: number;
    daily_return: number;
    validity_days: number;
  }) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_investments')
        .insert({
          user_id: user.id,
          plan_id: planData.plan_id,
          plan_name: planData.plan_name,
          investment_amount: planData.investment_amount,
          daily_return: planData.daily_return,
          validity_days: planData.validity_days,
          start_date: new Date().toISOString()
        });

      if (error) {
        console.error('Error adding investment:', error);
        return false;
      } else {
        await fetchUserInvestments();
        return true;
      }
    } catch (error) {
      console.error('Error adding investment:', error);
      return false;
    }
  };

  return {
    investments,
    summary,
    loading,
    addInvestment,
    refetch: fetchUserInvestments
  };
};
