import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useBlockUser = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get list of blocked users
  const { data: blockedUsers = [], isLoading } = useQuery({
    queryKey: ['blocked-users', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          id,
          blocked_id,
          created_at,
          profiles!blocked_users_blocked_id_fkey(user_id, full_name, avatar_url)
        `)
        .eq('blocker_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Check if a specific user is blocked
  const isUserBlocked = (userId: string): boolean => {
    return blockedUsers.some(b => b.blocked_id === userId);
  };

  // Block a user
  const blockUser = useMutation({
    mutationFn: async (blockedUserId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: blockedUserId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Đã chặn người dùng');
    },
    onError: () => {
      toast.error('Không thể chặn người dùng');
    },
  });

  // Unblock a user
  const unblockUser = useMutation({
    mutationFn: async (blockedUserId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedUserId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Đã bỏ chặn người dùng');
    },
    onError: () => {
      toast.error('Không thể bỏ chặn người dùng');
    },
  });

  return {
    blockedUsers,
    isLoading,
    isUserBlocked,
    blockUser,
    unblockUser,
  };
};
