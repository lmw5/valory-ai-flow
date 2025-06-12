
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface AddEarningsResponse {
  success: boolean;
  error?: string;
  new_balance?: number;
}

export const useSecureBalance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const updateBalance = async (newBalance: number, reason: string = 'Manual update'): Promise<boolean> => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return false;
    }

    setLoading(true);

    try {
      // First validate the balance update using our secure function
      const { data: isValid, error: validationError } = await supabase.rpc('validate_balance_update', {
        p_user_id: user.id,
        p_new_balance: newBalance,
        p_reason: reason
      });

      if (validationError) {
        console.error('Balance validation error:', validationError);
        toast.error('Erro ao validar atualização de saldo');
        return false;
      }

      if (!isValid) {
        toast.error('Atualização de saldo bloqueada por segurança');
        return false;
      }

      // If validation passes, update the balance
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Balance update error:', error);
        
        if (error.message.includes('Suspicious balance change detected')) {
          toast.error('Alteração de saldo suspeita detectada');
        } else if (error.message.includes('Invalid balance amount')) {
          toast.error('Valor de saldo inválido');
        } else {
          toast.error('Erro ao atualizar saldo');
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error updating balance:', error);
      toast.error('Erro inesperado ao atualizar saldo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addEarnings = async (amount: number, description: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Use the new secure function to add earnings
      const { data, error } = await supabase.rpc('add_user_earnings', {
        p_user_id: user.id,
        p_amount: amount,
        p_description: description,
        p_source: 'task_completion'
      });

      if (error) {
        console.error('Error adding earnings:', error);
        toast.error('Erro ao adicionar ganhos');
        return false;
      }

      const response = data as unknown as AddEarningsResponse;

      if (!response?.success) {
        console.error('Add earnings failed:', response?.error);
        toast.error(response?.error || 'Erro ao adicionar ganhos');
        return false;
      }

      toast.success(`Ganhos adicionados! Novo saldo: R$ ${response.new_balance?.toFixed(2)}`);
      return true;
    } catch (error) {
      console.error('Unexpected error adding earnings:', error);
      toast.error('Erro inesperado ao adicionar ganhos');
      return false;
    }
  };

  return {
    updateBalance,
    addEarnings,
    loading
  };
};
