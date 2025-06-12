
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

      // Fetch user profile with enhanced error handling
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Create profile if it doesn't exist with enhanced validation
        if (profileError.code === 'PGRST116') {
          const safeName = user.user_metadata?.name?.trim() || 'Usuário';
          const safeEmail = user.email?.trim() || '';
          
          // Validate inputs before inserting
          if (safeName.length <= 100 && safeEmail.length <= 255) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                name: safeName,
                email: safeEmail
              });
            
            if (!insertError) {
              setProfile({
                name: safeName,
                email: safeEmail
              });
            } else {
              console.error('Error creating profile:', insertError);
              toast.error('Erro ao criar perfil do usuário');
            }
          } else {
            console.error('Invalid profile data detected');
            toast.error('Dados de perfil inválidos');
          }
        }
      } else if (profileData) {
        setProfile(profileData);
      }

      // Fetch user session with enhanced error handling - ZERO BALANCE ONLY
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .select('balance, total_earned, connection_time, is_connected, last_connection')
        .eq('user_id', user.id)
        .maybeSingle();

      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        // Create session if it doesn't exist - ALWAYS start with ZERO balance
        if (sessionError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('user_sessions')
            .insert({
              user_id: user.id,
              balance: 0.00,
              total_earned: 0.00
            });
          
          if (!insertError) {
            setSession({
              balance: 0.00,
              total_earned: 0.00,
              connection_time: 0,
              is_connected: false,
              last_connection: null
            });
          } else {
            console.error('Error creating session:', insertError);
            toast.error('Erro ao inicializar sessão do usuário');
          }
        } else {
          toast.error('Erro ao carregar dados da sessão');
        }
      } else if (sessionData) {
        // Validate session data before setting state - ensure non-negative values only
        if (sessionData.balance >= 0 && sessionData.total_earned >= 0) {
          setSession(sessionData);
        } else {
          console.error('Invalid session data detected:', sessionData);
          toast.error('Dados de sessão inválidos detectados');
        }
      }

      // Count completed tasks with enhanced error handling
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
    // Enhanced input validation - no negative balances allowed
    if (typeof newBalance !== 'number' || isNaN(newBalance) || newBalance < 0) {
      toast.error('Valor de saldo inválido');
      return false;
    }

    const success = await secureUpdateBalance(newBalance, 'Manual balance update');
    if (success) {
      // Refresh local state
      await fetchUserData();
    }
    return success;
  };

  const addAchievement = async (taskTitle: string, earnings: number) => {
    // Enhanced input validation - only positive earnings allowed
    if (!taskTitle?.trim() || typeof earnings !== 'number' || earnings <= 0) {
      toast.error('Dados de conquista inválidos');
      return false;
    }

    // Limit task title length for security
    const safeTaskTitle = taskTitle.trim().substring(0, 200);
    
    const success = await addEarnings(earnings, `Tarefa "${safeTaskTitle}" concluída com sucesso`);
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
    // Enhanced input validation - all values must be positive
    if (!planData.plan_id?.trim() || !planData.plan_name?.trim()) {
      toast.error('Dados do plano inválidos');
      return false;
    }

    if (typeof planData.investment_amount !== 'number' || planData.investment_amount <= 0) {
      toast.error('Valor de investimento inválido');
      return false;
    }

    if (typeof planData.daily_return !== 'number' || planData.daily_return <= 0) {
      toast.error('Retorno diário inválido');
      return false;
    }

    if (typeof planData.validity_days !== 'number' || planData.validity_days <= 0) {
      toast.error('Período de validade inválido');
      return false;
    }

    // Sanitize input data
    const safePlanData = {
      plan_id: planData.plan_id.trim().substring(0, 50),
      plan_name: planData.plan_name.trim().substring(0, 100),
      investment_amount: planData.investment_amount,
      daily_return: planData.daily_return,
      validity_days: planData.validity_days
    };

    const success = await createInvestment(safePlanData);
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
