
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  old_values?: any;
  new_values?: any;
  created_at: string;
}

export const useAuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAuditLogs();
    } else {
      setLogs([]);
      setLoading(false);
    }
  }, [user]);

  const fetchAuditLogs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching audit logs:', error);
        setLogs([]);
      } else {
        setLogs(data || []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatLogAction = (action: string, tableName: string): string => {
    const actionMap: Record<string, string> = {
      INSERT: 'Criado',
      UPDATE: 'Atualizado',
      DELETE: 'Removido'
    };

    const tableMap: Record<string, string> = {
      user_sessions: 'Sessão',
      user_investments: 'Investimento',
      user_achievements: 'Conquista'
    };

    return `${actionMap[action] || action} ${tableMap[tableName] || tableName}`;
  };

  return {
    logs,
    loading,
    refetch: fetchAuditLogs,
    formatLogAction
  };
};
