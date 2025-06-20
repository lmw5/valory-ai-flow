
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
  investment_id?: string;
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
      console.log('Creating investment with data:', planData);

      // Use the secure database function to create investment with balance check
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

      const response = data as unknown as InvestmentResponse;
      console.log('Investment creation response:', response);

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

      console.log('Investment created successfully:', response.investment_id);
      toast.success(`Investimento criado com sucesso! Novo saldo: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(response.new_balance || 0)}`);

      // Force a small delay to ensure database changes are propagated
      await new Promise(resolve => setTimeout(resolve, 1000));

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
