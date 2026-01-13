import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_digest: string | null;
  email_notifications: string | null;
  email_admin_announcements: boolean | null;
  email_event_reminders: boolean | null;
  notify_likes: boolean | null;
  notify_comments: boolean | null;
  notify_mentions: boolean | null;
  notify_followers: boolean | null;
  notify_following_posts: boolean | null;
  notify_messages: boolean | null;
  notify_level_up: boolean | null;
  notify_affiliate_commission: boolean | null;
  push_enabled: boolean | null;
  created_at: string;
  updated_at: string;
}

const defaultSettings = {
  email_digest: 'off',
  email_notifications: 'instant',
  email_admin_announcements: true,
  email_event_reminders: true,
  notify_likes: true,
  notify_comments: true,
  notify_mentions: true,
  notify_followers: true,
  notify_following_posts: true,
  notify_messages: true,
  notify_level_up: true,
  notify_affiliate_commission: true,
  push_enabled: false,
};

export function useNotificationSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['notification-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Try to fetch existing settings
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If no settings exist, create default settings
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from('notification_settings')
          .insert({
            user_id: user.id,
            ...defaultSettings,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newSettings as NotificationSettings;
      }

      return data as NotificationSettings;
    },
    enabled: !!user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationSettings>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notification_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings', user?.id] });
      toast.success(t.notificationSettings.settingsSaved);
    },
    onError: (error) => {
      console.error('Failed to update notification settings:', error);
      toast.error(t.errors.somethingWentWrong);
    },
  });

  const updateSetting = (key: keyof NotificationSettings, value: string | boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  const disableAllNotifications = () => {
    updateMutation.mutate({
      email_digest: 'off',
      email_notifications: 'off',
      email_admin_announcements: false,
      email_event_reminders: false,
      notify_likes: false,
      notify_comments: false,
      notify_mentions: false,
      notify_followers: false,
      notify_following_posts: false,
      notify_messages: false,
      notify_level_up: false,
      notify_affiliate_commission: false,
      push_enabled: false,
    });
  };

  return {
    settings,
    isLoading,
    error,
    updateSetting,
    disableAllNotifications,
    isUpdating: updateMutation.isPending,
  };
}
