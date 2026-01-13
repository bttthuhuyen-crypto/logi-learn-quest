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
      auto_dm_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean | null
          message_template: string | null
          sender_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          message_template?: string | null
          sender_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          message_template?: string | null
          sender_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      banned_users: {
        Row: {
          banned_by: string | null
          created_at: string | null
          email: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          banned_by?: string | null
          created_at?: string | null
          email: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          banned_by?: string | null
          created_at?: string | null
          email?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          default_sort: Database["public"]["Enums"]["category_sort"]
          description: string | null
          emoji: string | null
          id: string
          name: string
          order_index: number
          post_count: number
          post_permission: Database["public"]["Enums"]["post_permission"]
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_sort?: Database["public"]["Enums"]["category_sort"]
          description?: string | null
          emoji?: string | null
          id?: string
          name: string
          order_index?: number
          post_count?: number
          post_permission?: Database["public"]["Enums"]["post_permission"]
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_sort?: Database["public"]["Enums"]["category_sort"]
          description?: string | null
          emoji?: string | null
          id?: string
          name?: string
          order_index?: number
          post_count?: number
          post_permission?: Database["public"]["Enums"]["post_permission"]
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_settings: {
        Row: {
          created_at: string
          id: string
          unlock_chat_enabled: boolean | null
          unlock_chat_level: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          unlock_chat_enabled?: boolean | null
          unlock_chat_level?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          unlock_chat_enabled?: boolean | null
          unlock_chat_level?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          like_count: number
          parent_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          like_count?: number
          parent_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          like_count?: number
          parent_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          logo_url: string | null
          member_count: number | null
          name: string
          owner_id: string
          requires_approval: boolean | null
          slug: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          name: string
          owner_id: string
          requires_approval?: boolean | null
          slug: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          name?: string
          owner_id?: string
          requires_approval?: boolean | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          comment_count: number | null
          community_id: string
          has_billing_access: boolean | null
          id: string
          joined_at: string
          last_active_at: string | null
          level: number | null
          muted_until: string | null
          points: number | null
          post_count: number | null
          role: Database["public"]["Enums"]["community_role"]
          status: Database["public"]["Enums"]["member_status"]
          user_id: string
        }
        Insert: {
          comment_count?: number | null
          community_id: string
          has_billing_access?: boolean | null
          id?: string
          joined_at?: string
          last_active_at?: string | null
          level?: number | null
          muted_until?: string | null
          points?: number | null
          post_count?: number | null
          role?: Database["public"]["Enums"]["community_role"]
          status?: Database["public"]["Enums"]["member_status"]
          user_id: string
        }
        Update: {
          comment_count?: number | null
          community_id?: string
          has_billing_access?: boolean | null
          id?: string
          joined_at?: string
          last_active_at?: string | null
          level?: number | null
          muted_until?: string | null
          points?: number | null
          post_count?: number | null
          role?: Database["public"]["Enums"]["community_role"]
          status?: Database["public"]["Enums"]["member_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
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
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          is_muted: boolean | null
          joined_at: string
          last_read_at: string | null
          left_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: string | null
          updated_at?: string
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
      event_attendees: {
        Row: {
          created_at: string
          event_id: string
          id: string
          joined_at: string | null
          status: Database["public"]["Enums"]["event_rsvp_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          joined_at?: string | null
          status?: Database["public"]["Enums"]["event_rsvp_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          joined_at?: string | null
          status?: Database["public"]["Enums"]["event_rsvp_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_notification_logs: {
        Row: {
          created_at: string | null
          event_id: string | null
          failed_sends: number | null
          id: string
          notification_type: string
          successful_sends: number | null
          total_recipients: number | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          failed_sends?: number | null
          id?: string
          notification_type: string
          successful_sends?: number | null
          total_recipients?: number | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          failed_sends?: number | null
          id?: string
          notification_type?: string
          successful_sends?: number | null
          total_recipients?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_notification_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reminders: {
        Row: {
          channel: string | null
          event_id: string
          id: string
          reminder_type: Database["public"]["Enums"]["event_reminder_type"]
          sent_at: string
          user_id: string
        }
        Insert: {
          channel?: string | null
          event_id: string
          id?: string
          reminder_type: Database["public"]["Enums"]["event_reminder_type"]
          sent_at?: string
          user_id: string
        }
        Update: {
          channel?: string | null
          event_id?: string
          id?: string
          reminder_type?: Database["public"]["Enums"]["event_reminder_type"]
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendee_count: number
          community_id: string | null
          cover_image_url: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          duration_minutes: number
          end_at: string | null
          event_type: string | null
          id: string
          is_recurring: boolean
          location_address: string | null
          location_type:
            | Database["public"]["Enums"]["event_location_type"]
            | null
          location_url: string | null
          meeting_url: string | null
          parent_event_id: string | null
          recurrence_day_of_week: number | null
          recurrence_end_date: string | null
          recurrence_end_type:
            | Database["public"]["Enums"]["event_recurrence_end_type"]
            | null
          recurrence_occurrences: number | null
          recurrence_pattern:
            | Database["public"]["Enums"]["event_recurrence_pattern"]
            | null
          skool_call_id: string | null
          start_at: string
          start_date: string
          start_time: string
          status: Database["public"]["Enums"]["event_status"]
          timezone: string
          title: string
          updated_at: string | null
        }
        Insert: {
          attendee_count?: number
          community_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          duration_minutes?: number
          end_at?: string | null
          event_type?: string | null
          id?: string
          is_recurring?: boolean
          location_address?: string | null
          location_type?:
            | Database["public"]["Enums"]["event_location_type"]
            | null
          location_url?: string | null
          meeting_url?: string | null
          parent_event_id?: string | null
          recurrence_day_of_week?: number | null
          recurrence_end_date?: string | null
          recurrence_end_type?:
            | Database["public"]["Enums"]["event_recurrence_end_type"]
            | null
          recurrence_occurrences?: number | null
          recurrence_pattern?:
            | Database["public"]["Enums"]["event_recurrence_pattern"]
            | null
          skool_call_id?: string | null
          start_at: string
          start_date: string
          start_time: string
          status?: Database["public"]["Enums"]["event_status"]
          timezone?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          attendee_count?: number
          community_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          duration_minutes?: number
          end_at?: string | null
          event_type?: string | null
          id?: string
          is_recurring?: boolean
          location_address?: string | null
          location_type?:
            | Database["public"]["Enums"]["event_location_type"]
            | null
          location_url?: string | null
          meeting_url?: string | null
          parent_event_id?: string | null
          recurrence_day_of_week?: number | null
          recurrence_end_date?: string | null
          recurrence_end_type?:
            | Database["public"]["Enums"]["event_recurrence_end_type"]
            | null
          recurrence_occurrences?: number | null
          recurrence_pattern?:
            | Database["public"]["Enums"]["event_recurrence_pattern"]
            | null
          skool_call_id?: string | null
          start_at?: string
          start_date?: string
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"]
          timezone?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
          community_id: string | null
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["membership_status"]
          user_id: string
        }
        Insert: {
          community_id?: string | null
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          user_id: string
        }
        Update: {
          community_id?: string | null
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_requests_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reads: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_size: number | null
          attachment_url: string | null
          content: string | null
          conversation_id: string
          created_at: string
          deleted_at: string | null
          id: string
          is_auto_dm: boolean | null
          message_type: Database["public"]["Enums"]["message_type"] | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_url?: string | null
          content?: string | null
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_auto_dm?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_url?: string | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_auto_dm?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          email_admin_announcements: boolean | null
          email_digest: string | null
          email_event_reminders: boolean | null
          email_notifications: string | null
          id: string
          notify_affiliate_commission: boolean | null
          notify_comments: boolean | null
          notify_followers: boolean | null
          notify_following_posts: boolean | null
          notify_level_up: boolean | null
          notify_likes: boolean | null
          notify_mentions: boolean | null
          notify_messages: boolean | null
          push_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_admin_announcements?: boolean | null
          email_digest?: string | null
          email_event_reminders?: boolean | null
          email_notifications?: string | null
          id?: string
          notify_affiliate_commission?: boolean | null
          notify_comments?: boolean | null
          notify_followers?: boolean | null
          notify_following_posts?: boolean | null
          notify_level_up?: boolean | null
          notify_likes?: boolean | null
          notify_mentions?: boolean | null
          notify_messages?: boolean | null
          push_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_admin_announcements?: boolean | null
          email_digest?: string | null
          email_event_reminders?: boolean | null
          email_notifications?: string | null
          id?: string
          notify_affiliate_commission?: boolean | null
          notify_comments?: boolean | null
          notify_followers?: boolean | null
          notify_following_posts?: boolean | null
          notify_level_up?: boolean | null
          notify_likes?: boolean | null
          notify_mentions?: boolean | null
          notify_messages?: boolean | null
          push_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          target_id: string | null
          target_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          target_id?: string | null
          target_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          target_id?: string | null
          target_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          course_id: string | null
          created_at: string
          failed_at: string | null
          id: string
          invoice_url: string | null
          order_code: string
          paid_at: string | null
          payment_method: string
          status: string
          transaction_code: string | null
          user_id: string
        }
        Insert: {
          amount: number
          course_id?: string | null
          created_at?: string
          failed_at?: string | null
          id?: string
          invoice_url?: string | null
          order_code: string
          paid_at?: string | null
          payment_method: string
          status?: string
          transaction_code?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          course_id?: string | null
          created_at?: string
          failed_at?: string | null
          id?: string
          invoice_url?: string | null
          order_code?: string
          paid_at?: string | null
          payment_method?: string
          status?: string
          transaction_code?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
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
      poll_options: {
        Row: {
          created_at: string
          id: string
          option_text: string
          order_index: number
          poll_id: string
          vote_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          option_text: string
          order_index?: number
          poll_id: string
          vote_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          option_text?: string
          order_index?: number
          poll_id?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          is_multiple_choice: boolean
          post_id: string
          question: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_multiple_choice?: boolean
          post_id: string
          question: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_multiple_choice?: boolean
          post_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_follows: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_follows_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_media: {
        Row: {
          created_at: string
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string
          order_index: number
          post_id: string
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string
          order_index?: number
          post_id: string
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string
          order_index?: number
          post_id?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          post_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status"] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          post_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          action_completed_count: number
          author_id: string
          category_id: string
          comment_count: number
          content: string | null
          content_type: Database["public"]["Enums"]["post_content_type"]
          created_at: string
          id: string
          is_action_post: boolean
          is_pinned: boolean
          last_activity_at: string
          like_count: number
          pinned_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          action_completed_count?: number
          author_id: string
          category_id: string
          comment_count?: number
          content?: string | null
          content_type?: Database["public"]["Enums"]["post_content_type"]
          created_at?: string
          id?: string
          is_action_post?: boolean
          is_pinned?: boolean
          last_activity_at?: string
          like_count?: number
          pinned_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          action_completed_count?: number
          author_id?: string
          category_id?: string
          comment_count?: number
          content?: string | null
          content_type?: Database["public"]["Enums"]["post_content_type"]
          created_at?: string
          id?: string
          is_action_post?: boolean
          is_pinned?: boolean
          last_activity_at?: string
          like_count?: number
          pinned_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          facebook_url: string | null
          full_name: string | null
          id: string
          level: number | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          points: number | null
          position: string | null
          preferred_language: string | null
          updated_at: string
          user_id: string
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          facebook_url?: string | null
          full_name?: string | null
          id?: string
          level?: number | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          points?: number | null
          position?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          facebook_url?: string | null
          full_name?: string | null
          id?: string
          level?: number | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          points?: number | null
          position?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
          youtube_url?: string | null
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
      user_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          community_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          points_earned: number | null
          target_id: string | null
          target_type: string | null
          user_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          community_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          target_id?: string | null
          target_type?: string | null
          user_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          community_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          target_id?: string | null
          target_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_payment_methods: {
        Row: {
          account_holder_name: string | null
          account_number: string | null
          bank_name: string
          branch: string | null
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_expiry: string | null
          card_holder_name: string | null
          card_last_four: string | null
          created_at: string
          id: string
          is_default: boolean | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_holder_name?: string | null
          account_number?: string | null
          bank_name: string
          branch?: string | null
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_expiry?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_holder_name?: string | null
          account_number?: string | null
          bank_name?: string
          branch?: string | null
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_expiry?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          last_seen_at: string | null
          show_online_status: boolean | null
          status: Database["public"]["Enums"]["presence_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          last_seen_at?: string | null
          show_online_status?: boolean | null
          status?: Database["public"]["Enums"]["presence_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          last_seen_at?: string | null
          show_online_status?: boolean | null
          status?: Database["public"]["Enums"]["presence_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reported_id: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status"] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: Database["public"]["Enums"]["report_reason"]
          reported_id: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reported_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Relationships: []
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
      user_sessions: {
        Row: {
          browser: string | null
          created_at: string
          device_type: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_current: boolean | null
          last_active_at: string | null
          location: string | null
          os: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active_at?: string | null
          location?: string | null
          os?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active_at?: string | null
          location?: string | null
          os?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          language: string
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_activity_stats: {
        Args: { p_community_id: string; p_user_id: string }
        Returns: Json
      }
      calculate_level_from_points: {
        Args: { p_points: number }
        Returns: number
      }
      generate_order_code: { Args: never; Returns: string }
      generate_recurring_events: {
        Args: { count_to_generate?: number; parent_id: string }
        Returns: {
          attendee_count: number
          community_id: string | null
          cover_image_url: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          duration_minutes: number
          end_at: string | null
          event_type: string | null
          id: string
          is_recurring: boolean
          location_address: string | null
          location_type:
            | Database["public"]["Enums"]["event_location_type"]
            | null
          location_url: string | null
          meeting_url: string | null
          parent_event_id: string | null
          recurrence_day_of_week: number | null
          recurrence_end_date: string | null
          recurrence_end_type:
            | Database["public"]["Enums"]["event_recurrence_end_type"]
            | null
          recurrence_occurrences: number | null
          recurrence_pattern:
            | Database["public"]["Enums"]["event_recurrence_pattern"]
            | null
          skool_call_id: string | null
          start_at: string
          start_date: string
          start_time: string
          status: Database["public"]["Enums"]["event_status"]
          timezone: string
          title: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "events"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      generate_referral_code: { Args: never; Returns: string }
      get_live_events: {
        Args: never
        Returns: {
          attendee_count: number
          community_id: string | null
          cover_image_url: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          duration_minutes: number
          end_at: string | null
          event_type: string | null
          id: string
          is_recurring: boolean
          location_address: string | null
          location_type:
            | Database["public"]["Enums"]["event_location_type"]
            | null
          location_url: string | null
          meeting_url: string | null
          parent_event_id: string | null
          recurrence_day_of_week: number | null
          recurrence_end_date: string | null
          recurrence_end_type:
            | Database["public"]["Enums"]["event_recurrence_end_type"]
            | null
          recurrence_occurrences: number | null
          recurrence_pattern:
            | Database["public"]["Enums"]["event_recurrence_pattern"]
            | null
          skool_call_id: string | null
          start_at: string
          start_date: string
          start_time: string
          status: Database["public"]["Enums"]["event_status"]
          timezone: string
          title: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "events"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_online_members_count: {
        Args: { p_community_id: string }
        Returns: number
      }
      get_upcoming_events: {
        Args: { limit_count?: number }
        Returns: {
          attendee_count: number
          community_id: string | null
          cover_image_url: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          duration_minutes: number
          end_at: string | null
          event_type: string | null
          id: string
          is_recurring: boolean
          location_address: string | null
          location_type:
            | Database["public"]["Enums"]["event_location_type"]
            | null
          location_url: string | null
          meeting_url: string | null
          parent_event_id: string | null
          recurrence_day_of_week: number | null
          recurrence_end_date: string | null
          recurrence_end_type:
            | Database["public"]["Enums"]["event_recurrence_end_type"]
            | null
          recurrence_occurrences: number | null
          recurrence_pattern:
            | Database["public"]["Enums"]["event_recurrence_pattern"]
            | null
          skool_call_id: string | null
          start_at: string
          start_date: string
          start_time: string
          status: Database["public"]["Enums"]["event_status"]
          timezone: string
          title: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "events"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_blocked: {
        Args: { blocked_user_id: string; blocker_user_id: string }
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_activity_type: Database["public"]["Enums"]["activity_type"]
          p_community_id: string
          p_metadata?: Json
          p_target_id?: string
          p_target_type?: string
          p_user_id: string
        }
        Returns: string
      }
      update_member_level: {
        Args: { p_community_id: string; p_user_id: string }
        Returns: number
      }
    }
    Enums: {
      activity_type:
        | "post"
        | "comment"
        | "like"
        | "follow"
        | "join"
        | "complete_course"
        | "complete_lesson"
        | "level_up"
        | "earn_badge"
      app_role: "owner" | "admin" | "moderator" | "paid_member" | "free_member"
      category_sort: "default" | "new" | "top_week" | "top_month"
      community_role: "owner" | "admin" | "moderator" | "member"
      event_location_type:
        | "skool_call"
        | "skool_webinar"
        | "zoom"
        | "google_meet"
        | "in_person"
        | "other"
      event_recurrence_end_type: "never" | "on_date" | "after_occurrences"
      event_recurrence_pattern: "daily" | "weekly" | "monthly" | "yearly"
      event_reminder_type: "24h" | "1h" | "15m"
      event_rsvp_status: "going" | "maybe" | "not_going"
      event_status: "scheduled" | "live" | "ended" | "cancelled"
      lesson_access_level: "public" | "member" | "level"
      media_type: "image" | "video" | "gif" | "link"
      member_status: "active" | "muted" | "banned"
      membership_status: "pending" | "approved" | "declined"
      message_type: "text" | "image" | "file"
      payout_status: "pending" | "processing" | "completed" | "rejected"
      post_content_type: "text" | "poll"
      post_permission: "all" | "admin_only"
      presence_status: "online" | "away" | "offline"
      question_type: "text" | "multiple_choice" | "email"
      referral_status: "pending" | "confirmed" | "paid" | "reversed"
      report_reason:
        | "spam"
        | "harassment"
        | "inappropriate"
        | "scam"
        | "impersonation"
        | "other"
      report_status: "pending" | "reviewed" | "resolved"
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
      activity_type: [
        "post",
        "comment",
        "like",
        "follow",
        "join",
        "complete_course",
        "complete_lesson",
        "level_up",
        "earn_badge",
      ],
      app_role: ["owner", "admin", "moderator", "paid_member", "free_member"],
      category_sort: ["default", "new", "top_week", "top_month"],
      community_role: ["owner", "admin", "moderator", "member"],
      event_location_type: [
        "skool_call",
        "skool_webinar",
        "zoom",
        "google_meet",
        "in_person",
        "other",
      ],
      event_recurrence_end_type: ["never", "on_date", "after_occurrences"],
      event_recurrence_pattern: ["daily", "weekly", "monthly", "yearly"],
      event_reminder_type: ["24h", "1h", "15m"],
      event_rsvp_status: ["going", "maybe", "not_going"],
      event_status: ["scheduled", "live", "ended", "cancelled"],
      lesson_access_level: ["public", "member", "level"],
      media_type: ["image", "video", "gif", "link"],
      member_status: ["active", "muted", "banned"],
      membership_status: ["pending", "approved", "declined"],
      message_type: ["text", "image", "file"],
      payout_status: ["pending", "processing", "completed", "rejected"],
      post_content_type: ["text", "poll"],
      post_permission: ["all", "admin_only"],
      presence_status: ["online", "away", "offline"],
      question_type: ["text", "multiple_choice", "email"],
      referral_status: ["pending", "confirmed", "paid", "reversed"],
      report_reason: [
        "spam",
        "harassment",
        "inappropriate",
        "scam",
        "impersonation",
        "other",
      ],
      report_status: ["pending", "reviewed", "resolved"],
    },
  },
} as const
