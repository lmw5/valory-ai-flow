
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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
      // The database triggers will validate the balance amount
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Balance update error:', error);
        
        if (error.message.includes('Invalid balance amount')) {
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
      // Get current session
      const { data: session, error: sessionError } = await supabase
        .from('user_sessions')
        .select('balance, total_earned')
        .eq('user_id', user.id)
        .single();

      if (sessionError || !session) {
        toast.error('Erro ao buscar dados da sessão');
        return false;
      }

      // Update balance and total_earned atomically
      const newBalance = session.balance + amount;
      const newTotalEarned = session.total_earned + amount;

      const { error: updateError } = await supabase
        .from('user_sessions')
        .update({ 
          balance: newBalance,
          total_earned: newTotalEarned,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating earnings:', updateError);
        return false;
      }

      // Add achievement record
      const { error: achievementError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_type: 'earnings',
          achievement_name: 'Ganhos Adicionados',
          description: description,
          value: Math.round(amount)
        });

      if (achievementError) {
        console.error('Error adding achievement:', achievementError);
        // Don't fail the operation if achievement logging fails
      }

      return true;
    } catch (error) {
      console.error('Unexpected error adding earnings:', error);
      return false;
    }
  };

  return {
    updateBalance,
    addEarnings,
    loading
  };
};
