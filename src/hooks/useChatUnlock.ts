import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface ChatUnlockStatus {
  canChat: boolean;
  isLoading: boolean;
  requiredLevel: number;
  currentLevel: number;
  isEnabled: boolean;
}

export const useChatUnlock = (): ChatUnlockStatus => {
  const { profile } = useAuth();
  const { isAdmin, isOwner, loading: roleLoading } = useUserRole();

  const { data: chatSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['chat-settings-unlock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_settings')
        .select('unlock_chat_enabled, unlock_chat_level')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const isLoading = settingsLoading || roleLoading;
  const isEnabled = chatSettings?.unlock_chat_enabled ?? false;
  const requiredLevel = chatSettings?.unlock_chat_level ?? 1;
  const currentLevel = profile?.level ?? 0;

  // Determine if user can chat
  let canChat = true;
  
  if (isEnabled) {
    // Admin/Owner always can chat
    if (isAdmin || isOwner) {
      canChat = true;
    } else {
      // Check if user's level meets requirement
      canChat = currentLevel >= requiredLevel;
    }
  }

  return {
    canChat,
    isLoading,
    requiredLevel,
    currentLevel,
    isEnabled,
  };
};
