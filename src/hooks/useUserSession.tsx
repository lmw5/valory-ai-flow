
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSecureBalance } from './useSecureBalance';
import { useSecureInvestments } from './useSecureInvestments';
import { toast } from 'sonner';

interface UserSession {
  balance: number;
  total_earned: number;
  connection_time: number;
  is_connected: boolean;
  last_connection: string | null;
}

interface UserProfile {
  name: string;
  email: string;
}

export const useUserSession = () => {
  const { user } = useAuth();
  const { updateBalance: secureUpdateBalance, addEarnings } = useSecureBalance();
  const { createInvestment } = useSecureInvestments();
  const [session, setSession] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setSession(null);
      setProfile(null);
      setCompletedTasks(0);
      setLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user profile with error handling
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Create profile if it doesn't exist
        if (profileError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name: user.user_metadata?.name || 'Usuário',
              email: user.email || ''
            });
          
          if (!insertError) {
            setProfile({
              name: user.user_metadata?.name || 'Usuário',
              email: user.email || ''
            });
          }
        }
      } else if (profileData) {
        setProfile(profileData);
      }

      // Fetch user session with error handling
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .select('balance, total_earned, connection_time, is_connected, last_connection')
        .eq('user_id', user.id)
        .maybeSingle();

      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        // Create session if it doesn't exist
        if (sessionError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('user_sessions')
            .insert({
              user_id: user.id,
              balance: 50.00,
              total_earned: 50.00
            });
          
          if (!insertError) {
            setSession({
              balance: 50.00,
              total_earned: 50.00,
              connection_time: 0,
              is_connected: false,
              last_connection: null
            });
          }
        }
      } else if (sessionData) {
        setSession(sessionData);
      }

      // Count completed tasks with error handling
      const { count, error: countError } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.error('Error counting achievements:', countError);
        setCompletedTasks(0);
      } else {
        setCompletedTasks(count || 0);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async (newBalance: number) => {
    const success = await secureUpdateBalance(newBalance, 'Manual balance update');
    if (success) {
      // Refresh local state
      await fetchUserData();
    }
    return success;
  };

  const addAchievement = async (taskTitle: string, earnings: number) => {
    const success = await addEarnings(earnings, `Tarefa "${taskTitle}" concluída com sucesso`);
    if (success) {
      // Refresh local state
      await fetchUserData();
    }
    return success;
  };

  const addInvestment = async (planData: {
    plan_id: string;
    plan_name: string;
    investment_amount: number;
    daily_return: number;
    validity_days: number;
  }) => {
    const success = await createInvestment(planData);
    if (success) {
      // Refresh local state to reflect the deducted balance
      await fetchUserData();
    }
    return success;
  };

  return {
    session,
    profile,
    completedTasks,
    loading,
    updateBalance,
    addAchievement,
    addInvestment,
    refetch: fetchUserData
  };
};
