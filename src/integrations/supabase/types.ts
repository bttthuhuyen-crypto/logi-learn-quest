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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      affiliate_balances: {
        Row: {
          available_amount: number
          id: string
          pending_amount: number
          total_earned: number
          total_withdrawn: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_amount?: number
          id?: string
          pending_amount?: number
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_amount?: number
          id?: string
          pending_amount?: number
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_links: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_settings: {
        Row: {
          cookie_duration_days: number
          created_at: string
          default_commission_rate: number
          id: string
          is_enabled: boolean
          min_payout_amount: number
          pending_period_days: number
          updated_at: string
        }
        Insert: {
          cookie_duration_days?: number
          created_at?: string
          default_commission_rate?: number
          id?: string
          is_enabled?: boolean
          min_payout_amount?: number
          pending_period_days?: number
          updated_at?: string
        }
        Update: {
          cookie_duration_days?: number
          created_at?: string
          default_commission_rate?: number
          id?: string
          is_enabled?: boolean
          min_payout_amount?: number
          pending_period_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      community_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      course_affiliate_settings: {
        Row: {
          commission_rate: number | null
          course_id: string
          created_at: string
          id: string
          is_enabled: boolean
        }
        Insert: {
          commission_rate?: number | null
          course_id: string
          created_at?: string
          id?: string
          is_enabled?: boolean
        }
        Update: {
          commission_rate?: number | null
          course_id?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "course_affiliate_settings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          access_level:
            | Database["public"]["Enums"]["lesson_access_level"]
            | null
          content: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          is_published: boolean | null
          order_index: number | null
          required_level: number | null
          section_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          access_level?:
            | Database["public"]["Enums"]["lesson_access_level"]
            | null
          content?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          required_level?: number | null
          section_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          access_level?:
            | Database["public"]["Enums"]["lesson_access_level"]
            | null
          content?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          required_level?: number | null
          section_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sections: {
        Row: {
          course_id: string
          created_at: string
          id: string
          order_index: number | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          order_index?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          order_index?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          created_by: string | null
          cta_text: string | null
          description: string | null
          id: string
          introduction_content: string | null
          is_paid: boolean | null
          is_published: boolean | null
          order_index: number | null
          price: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          introduction_content?: string | null
          is_paid?: boolean | null
          is_published?: boolean | null
          order_index?: number | null
          price?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          introduction_content?: string | null
          is_paid?: boolean | null
          is_published?: boolean | null
          order_index?: number | null
          price?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      membership_answers: {
        Row: {
          answer_text: string
          created_at: string
          id: string
          question_id: string
          request_id: string
        }
        Insert: {
          answer_text: string
          created_at?: string
          id?: string
          question_id: string
          request_id: string
        }
        Update: {
          answer_text?: string
          created_at?: string
          id?: string
          question_id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "membership_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_answers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "membership_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_questions: {
        Row: {
          created_at: string
          id: string
          is_required: boolean | null
          options: Json | null
          order_index: number
          question_text: string
          question_text_en: string | null
          question_type: Database["public"]["Enums"]["question_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean | null
          options?: Json | null
          order_index?: number
          question_text: string
          question_text_en?: string | null
          question_type?: Database["public"]["Enums"]["question_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean | null
          options?: Json | null
          order_index?: number
          question_text?: string
          question_text_en?: string | null
          question_type?: Database["public"]["Enums"]["question_type"]
          updated_at?: string
        }
        Relationships: []
      }
      membership_requests: {
        Row: {
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["membership_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          amount: number
          bank_account_name: string
          bank_account_number: string
          bank_branch: string | null
          bank_name: string
          created_at: string
          id: string
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["payout_status"]
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_name: string
          bank_account_number: string
          bank_branch?: string | null
          bank_name: string
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_name?: string
          bank_account_number?: string
          bank_branch?: string | null
          bank_name?: string
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          level: number | null
          points: number | null
          preferred_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          level?: number | null
          points?: number | null
          preferred_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          level?: number | null
          points?: number | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_clicks: {
        Row: {
          affiliate_link_id: string
          clicked_at: string
          id: string
          ip_address: string | null
          landing_page: string | null
          user_agent: string | null
        }
        Insert: {
          affiliate_link_id: string
          clicked_at?: string
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          user_agent?: string | null
        }
        Update: {
          affiliate_link_id?: string
          clicked_at?: string
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_clicks_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          affiliate_id: string
          commission_amount: number
          commission_rate: number
          course_id: string | null
          created_at: string
          id: string
          order_amount: number
          pending_until: string | null
          referred_user_id: string
          status: Database["public"]["Enums"]["referral_status"]
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          commission_amount: number
          commission_rate: number
          course_id?: string | null
          created_at?: string
          id?: string
          order_amount?: number
          pending_until?: string | null
          referred_user_id: string
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number
          commission_rate?: number
          course_id?: string | null
          created_at?: string
          id?: string
          order_amount?: number
          pending_until?: string | null
          referred_user_id?: string
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "moderator" | "paid_member" | "free_member"
      lesson_access_level: "public" | "member" | "level"
      membership_status: "pending" | "approved" | "declined"
      payout_status: "pending" | "processing" | "completed" | "rejected"
      question_type: "text" | "multiple_choice" | "email"
      referral_status: "pending" | "confirmed" | "paid" | "reversed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "moderator", "paid_member", "free_member"],
      lesson_access_level: ["public", "member", "level"],
      membership_status: ["pending", "approved", "declined"],
      payout_status: ["pending", "processing", "completed", "rejected"],
      question_type: ["text", "multiple_choice", "email"],
      referral_status: ["pending", "confirmed", "paid", "reversed"],
    },
  },
} as const
