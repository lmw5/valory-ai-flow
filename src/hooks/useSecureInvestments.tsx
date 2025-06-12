
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface InvestmentPlan {
  plan_id: string;
  plan_name: string;
  investment_amount: number;
  daily_return: number;
  validity_days: number;
}

export const useSecureInvestments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createInvestment = async (planData: InvestmentPlan): Promise<boolean> => {
    if (!user) {
      toast.error('Você precisa estar logado para investir');
      return false;
    }

    setLoading(true);
    
    try {
      // The database triggers will now handle all validation and balance checking
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
        console.error('Investment creation error:', error);
        
        // Handle specific validation errors with user-friendly messages
        if (error.message.includes('Insufficient balance')) {
          toast.error('Saldo insuficiente para este investimento');
        } else if (error.message.includes('Invalid investment parameters')) {
          toast.error('Parâmetros de investimento inválidos');
        } else if (error.message.includes('Invalid plan')) {
          toast.error('Plano de investimento inválido');
        } else {
          toast.error('Erro ao criar investimento. Tente novamente.');
        }
        return false;
      }

      toast.success('Investimento criado com sucesso!');
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Erro inesperado. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkSuspiciousActivity = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('detect_suspicious_investment_activity', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error checking suspicious activity:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return false;
    }
  };

  return {
    createInvestment,
    checkSuspiciousActivity,
    loading
  };
};
