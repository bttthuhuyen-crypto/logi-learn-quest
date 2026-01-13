import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

export interface ChatSettings {
  id: string;
  unlock_chat_enabled: boolean;
  unlock_chat_level: number;
  created_at: string;
  updated_at: string;
}

export interface AutoDMSettings {
  id: string;
  is_enabled: boolean;
  message_template: string;
  sender_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useChatSettings = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  // Fetch chat settings
  const { data: chatSettings, isLoading: chatLoading } = useQuery({
    queryKey: ['chat-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as ChatSettings | null;
    },
  });

  // Fetch auto DM settings
  const { data: autoDMSettings, isLoading: autoDMLoading } = useQuery({
    queryKey: ['auto-dm-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auto_dm_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as AutoDMSettings | null;
    },
  });

  // Update chat settings
  const updateChatSettings = useMutation({
    mutationFn: async (settings: Partial<ChatSettings>) => {
      if (chatSettings?.id) {
        const { error } = await supabase
          .from('chat_settings')
          .update(settings)
          .eq('id', chatSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('chat_settings')
          .insert(settings);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-settings'] });
      toast.success(language === 'vi' ? 'Đã lưu cài đặt' : 'Settings saved');
    },
    onError: () => {
      toast.error(language === 'vi' ? 'Không thể lưu cài đặt' : 'Failed to save settings');
    },
  });

  // Update auto DM settings
  const updateAutoDMSettings = useMutation({
    mutationFn: async (settings: Partial<AutoDMSettings>) => {
      if (autoDMSettings?.id) {
        const { error } = await supabase
          .from('auto_dm_settings')
          .update(settings)
          .eq('id', autoDMSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('auto_dm_settings')
          .insert(settings);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-dm-settings'] });
      toast.success(language === 'vi' ? 'Đã lưu cài đặt' : 'Settings saved');
    },
    onError: () => {
      toast.error(language === 'vi' ? 'Không thể lưu cài đặt' : 'Failed to save settings');
    },
  });

  return {
    chatSettings,
    autoDMSettings,
    isLoading: chatLoading || autoDMLoading,
    updateChatSettings,
    updateAutoDMSettings,
  };
};
