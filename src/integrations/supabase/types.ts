export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          description: string
          earned_at: string
          id: string
          user_id: string
          value: number
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          description: string
          earned_at?: string
          id?: string
          user_id: string
          value?: number
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          description?: string
          earned_at?: string
          id?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_investments: {
        Row: {
          created_at: string
          daily_return: number
          id: string
          investment_amount: number
          plan_id: string
          plan_name: string
          start_date: string
          updated_at: string
          user_id: string
          validity_days: number
        }
        Insert: {
          created_at?: string
          daily_return: number
          id?: string
          investment_amount: number
          plan_id: string
          plan_name: string
          start_date?: string
          updated_at?: string
          user_id: string
          validity_days: number
        }
        Update: {
          created_at?: string
          daily_return?: number
          id?: string
          investment_amount?: number
          plan_id?: string
          plan_name?: string
          start_date?: string
          updated_at?: string
          user_id?: string
          validity_days?: number
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          balance: number
          connection_time: number
          created_at: string
          id: string
          is_connected: boolean
          last_connection: string | null
          total_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          connection_time?: number
          created_at?: string
          id?: string
          is_connected?: boolean
          last_connection?: string | null
          total_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          connection_time?: number
          created_at?: string
          id?: string
          is_connected?: boolean
          last_connection?: string | null
          total_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_earnings: {
        Args: {
          p_user_id: string
          p_amount: number
          p_description: string
          p_source?: string
        }
        Returns: Json
      }
      calculate_daily_profits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_user_balance: {
        Args: { user_uuid: string; required_amount: number }
        Returns: boolean
      }
      create_investment_with_balance_check: {
        Args: {
          p_user_id: string
          p_plan_id: string
          p_plan_name: string
          p_investment_amount: number
          p_daily_return: number
          p_validity_days: number
        }
        Returns: Json
      }
      detect_suspicious_investment_activity: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      enforce_zero_balance_on_signup: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_audit_event: {
        Args: {
          p_user_id: string
          p_action: string
          p_table_name: string
          p_old_values?: Json
          p_new_values?: Json
        }
        Returns: undefined
      }
      sanitize_user_input: {
        Args: { input_text: string }
        Returns: string
      }
      trigger_daily_profits: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      validate_balance_update: {
        Args: { p_user_id: string; p_new_balance: number; p_reason?: string }
        Returns: boolean
      }
      validate_investment_plan: {
        Args: {
          investment_amount: number
          daily_return: number
          validity_days: number
        }
        Returns: boolean
      }
      validate_monetary_amount: {
        Args: { amount: number; min_amount?: number; max_amount?: number }
        Returns: boolean
      }
      validate_text_input: {
        Args: { input_text: string; max_length?: number }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
