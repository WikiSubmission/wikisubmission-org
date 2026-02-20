export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5'
  }
  internal: {
    Tables: {
      ws_discord_cache: {
        Row: {
          created_at: string | null
          key: string
          value: string
        }
        Insert: {
          created_at?: string | null
          key: string
          value: string
        }
        Update: {
          created_at?: string | null
          key?: string
          value?: string
        }
        Relationships: []
      }
      ws_discord_constants: {
        Row: {
          created_at: string | null
          key: string
          value: string
        }
        Insert: {
          created_at?: string | null
          key: string
          value: string
        }
        Update: {
          created_at?: string | null
          key?: string
          value?: string
        }
        Relationships: []
      }
      ws_discord_members: {
        Row: {
          avatar_url: string
          created_at: string
          created_timestamp: number
          display_name: string
          guild_id: string
          id: string
          joined_timestamp: number
          roles: string
          user_id: string
          user_name: string
        }
        Insert: {
          avatar_url?: string
          created_at?: string
          created_timestamp: number
          display_name: string
          guild_id: string
          id: string
          joined_timestamp: number
          roles?: string
          user_id: string
          user_name: string
        }
        Update: {
          avatar_url?: string
          created_at?: string
          created_timestamp?: number
          display_name?: string
          guild_id?: string
          id?: string
          joined_timestamp?: number
          roles?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      ws_discord_message_deletion_schedule: {
        Row: {
          channel_id: string
          created_at: string
          execute_at: string
          id: number
          is_executed: boolean
          message_ids: string[]
          request_by_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          execute_at: string
          id?: number
          is_executed?: boolean
          message_ids: string[]
          request_by_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          execute_at?: string
          id?: number
          is_executed?: boolean
          message_ids?: string[]
          request_by_id?: string
        }
        Relationships: []
      }
      ws_notifications_ios: {
        Row: {
          announcement_last_delivery_at: string | null
          announcement_notifications: boolean | null
          created_at: string
          daily_chapter_last_delivery_at: string | null
          daily_chapter_notifications: boolean | null
          daily_verse_last_delivery_at: string | null
          daily_verse_notifications: boolean | null
          device_token: string
          is_sandbox: boolean
          last_delivery_at: string | null
          prayer_times_last_delivery_at: string | null
          prayer_times_notifications: Json
          updated_at: string | null
        }
        Insert: {
          announcement_last_delivery_at?: string | null
          announcement_notifications?: boolean | null
          created_at?: string
          daily_chapter_last_delivery_at?: string | null
          daily_chapter_notifications?: boolean | null
          daily_verse_last_delivery_at?: string | null
          daily_verse_notifications?: boolean | null
          device_token: string
          is_sandbox?: boolean
          last_delivery_at?: string | null
          prayer_times_last_delivery_at?: string | null
          prayer_times_notifications?: Json
          updated_at?: string | null
        }
        Update: {
          announcement_last_delivery_at?: string | null
          announcement_notifications?: boolean | null
          created_at?: string
          daily_chapter_last_delivery_at?: string | null
          daily_chapter_notifications?: boolean | null
          daily_verse_last_delivery_at?: string | null
          daily_verse_notifications?: boolean | null
          device_token?: string
          is_sandbox?: boolean
          last_delivery_at?: string | null
          prayer_times_last_delivery_at?: string | null
          prayer_times_notifications?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      ws_profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  internal: {
    Enums: {},
  },
} as const
