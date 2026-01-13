import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type MuteDuration = '1h' | '24h' | '7d' | '30d' | 'forever';
export type CommunityRole = 'owner' | 'admin' | 'moderator' | 'member';

interface MemberManagementData {
  userId: string;
  communityId?: string;
}

const getMutedUntil = (duration: MuteDuration): string | null => {
  const now = new Date();
  switch (duration) {
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    case '24h':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30d':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    case 'forever':
      return null; // null = forever until unmute
    default:
      return null;
  }
};

export const useMemberManagement = ({ userId, communityId }: MemberManagementData) => {
  const queryClient = useQueryClient();

  // Query for activity stats
  const { data: activityStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['member-management-stats', userId],
    queryFn: async () => {
      const [postsResult, commentsResult, likesResult] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', userId),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('author_id', userId),
        // Get likes received on user's posts
        supabase.from('posts').select('like_count').eq('author_id', userId),
      ]);

      const totalLikes = likesResult.data?.reduce((sum, post) => sum + (post.like_count || 0), 0) || 0;

      return {
        posts: postsResult.count || 0,
        comments: commentsResult.count || 0,
        likesReceived: totalLikes,
      };
    },
    enabled: !!userId,
  });

  // Query for community member data
  const { data: memberData, isLoading: isLoadingMember } = useQuery({
    queryKey: ['member-community-data', userId, communityId],
    queryFn: async () => {
      const query = supabase
        .from('community_members')
        .select('*')
        .eq('user_id', userId);

      if (communityId) {
        query.eq('community_id', communityId);
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Update role mutation
  const updateRole = useMutation({
    mutationFn: async ({ role }: { role: CommunityRole }) => {
      const { error } = await supabase
        .from('community_members')
        .update({ role })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-community-data', userId] });
      queryClient.invalidateQueries({ queryKey: ['community-members'] });
      toast.success('Đã cập nhật vai trò thành viên');
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      toast.error('Không thể cập nhật vai trò');
    },
  });

  // Toggle billing access mutation
  const toggleBillingAccess = useMutation({
    mutationFn: async ({ hasBillingAccess }: { hasBillingAccess: boolean }) => {
      const { error } = await supabase
        .from('community_members')
        .update({ has_billing_access: hasBillingAccess })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-community-data', userId] });
      toast.success('Đã cập nhật quyền truy cập billing');
    },
    onError: (error) => {
      console.error('Error toggling billing access:', error);
      toast.error('Không thể cập nhật quyền truy cập billing');
    },
  });

  // Mute user mutation
  const muteUser = useMutation({
    mutationFn: async ({ duration }: { duration: MuteDuration }) => {
      const mutedUntil = getMutedUntil(duration);
      const { error } = await supabase
        .from('community_members')
        .update({
          status: 'muted' as const,
          muted_until: mutedUntil,
        })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-community-data', userId] });
      queryClient.invalidateQueries({ queryKey: ['community-members'] });
      toast.success('Đã tắt tiếng thành viên');
    },
    onError: (error) => {
      console.error('Error muting user:', error);
      toast.error('Không thể tắt tiếng thành viên');
    },
  });

  // Unmute user mutation
  const unmuteUser = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('community_members')
        .update({
          status: 'active' as const,
          muted_until: null,
        })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-community-data', userId] });
      queryClient.invalidateQueries({ queryKey: ['community-members'] });
      toast.success('Đã bỏ tắt tiếng thành viên');
    },
    onError: (error) => {
      console.error('Error unmuting user:', error);
      toast.error('Không thể bỏ tắt tiếng thành viên');
    },
  });

  // Remove from community mutation
  const removeFromCommunity = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-members'] });
      toast.success('Đã xóa thành viên khỏi cộng đồng');
    },
    onError: (error) => {
      console.error('Error removing member:', error);
      toast.error('Không thể xóa thành viên');
    },
  });

  // Ban permanently mutation
  const banPermanently = useMutation({
    mutationFn: async ({ email, reason, bannedBy }: { email: string; reason?: string; bannedBy: string }) => {
      // Insert into banned_users
      const { error: banError } = await supabase.from('banned_users').insert({
        user_id: userId,
        email,
        banned_by: bannedBy,
        reason,
      });

      if (banError) throw banError;

      // Remove from community_members
      const { error: removeError } = await supabase
        .from('community_members')
        .delete()
        .eq('user_id', userId);

      if (removeError) throw removeError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-members'] });
      toast.success('Đã cấm thành viên vĩnh viễn');
    },
    onError: (error) => {
      console.error('Error banning member:', error);
      toast.error('Không thể cấm thành viên');
    },
  });

  return {
    activityStats,
    isLoadingStats,
    memberData,
    isLoadingMember,
    updateRole,
    toggleBillingAccess,
    muteUser,
    unmuteUser,
    removeFromCommunity,
    banPermanently,
  };
};
