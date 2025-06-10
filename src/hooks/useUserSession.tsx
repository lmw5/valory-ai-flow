
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
    if (!user || !session) return;

    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          balance: newBalance,
          total_earned: session.total_earned + (newBalance - session.balance)
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating balance:', error);
      } else {
        setSession(prev => prev ? {
          ...prev,
          balance: newBalance,
          total_earned: prev.total_earned + (newBalance - prev.balance)
        } : null);
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const addAchievement = async (taskTitle: string, earnings: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_type: 'task_completion',
          achievement_name: taskTitle,
          description: `Tarefa "${taskTitle}" concluída com sucesso`,
          value: earnings
        });

      if (error) {
        console.error('Error adding achievement:', error);
      } else {
        setCompletedTasks(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error adding achievement:', error);
    }
  };

  return {
    session,
    profile,
    completedTasks,
    loading,
    updateBalance,
    addAchievement,
    refetch: fetchUserData
  };
};
