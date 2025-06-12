
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSecureBalance } from './useSecureBalance';
import { useSecureInvestments } from './useSecureInvestments';

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
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch user session
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .select('balance, total_earned, connection_time, is_connected, last_connection')
        .eq('user_id', user.id)
        .single();

      if (sessionError) {
        console.error('Error fetching session:', sessionError);
      } else {
        setSession(sessionData);
      }

      // Count completed tasks
      const { count, error: countError } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.error('Error counting achievements:', countError);
      } else {
        setCompletedTasks(count || 0);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
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
