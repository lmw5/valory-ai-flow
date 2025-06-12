
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

interface InvestmentResponse {
  success: boolean;
  error?: string;
  new_balance?: number;
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
      // Use the new secure database function to create investment with balance check
      const { data, error } = await supabase.rpc('create_investment_with_balance_check', {
        p_user_id: user.id,
        p_plan_id: planData.plan_id,
        p_plan_name: planData.plan_name,
        p_investment_amount: planData.investment_amount,
        p_daily_return: planData.daily_return,
        p_validity_days: planData.validity_days
      });

      if (error) {
        console.error('Investment creation error:', error);
        toast.error('Erro ao criar investimento. Tente novamente.');
        return false;
      }

      const response = data as InvestmentResponse;

      // Check the result from the function
      if (!response?.success) {
        console.error('Investment creation failed:', response?.error);
        
        // Handle specific error cases with user-friendly messages
        if (response?.error?.includes('Insufficient balance')) {
          toast.error('Saldo insuficiente para este investimento');
        } else if (response?.error?.includes('Invalid investment parameters')) {
          toast.error('Parâmetros de investimento inválidos');
        } else if (response?.error?.includes('User session not found')) {
          toast.error('Sessão de usuário não encontrada');
        } else {
          toast.error(response?.error || 'Erro ao criar investimento');
        }
        return false;
      }

      toast.success(`Investimento criado com sucesso! Novo saldo: R$ ${response.new_balance?.toFixed(2)}`);
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
