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

  return {
    settings,
    isLoading,
    error,
    updateSetting,
    isUpdating: updateMutation.isPending,
  };
}
