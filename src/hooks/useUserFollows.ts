import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FollowUser {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  level: number | null;
  created_at: string;
}

const PAGE_SIZE = 20;

export const useFollowers = (userId: string | undefined, page: number = 1, search?: string) => {
  return useQuery({
    queryKey: ['followers', userId, page, search],
    queryFn: async () => {
      if (!userId) return { data: [], total: 0 };

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Get followers with profile info
      const { data, error } = await supabase
        .from('user_follows')
        .select('id, follower_id, created_at')
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching followers:', error);
        return { data: [], total: 0 };
      }

      // Fetch profiles for followers
      const followerIds = data?.map(f => f.follower_id) || [];
      
      if (followerIds.length === 0) {
        return { data: [], total: 0 };
      }

      let profileQuery = supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, bio, level')
        .in('user_id', followerIds);

      // Apply search filter if provided
      if (search && search.trim()) {
        profileQuery = profileQuery.ilike('full_name', `%${search.trim()}%`);
      }

      const { data: profiles } = await profileQuery;
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      // Filter data based on search results
      const filteredData = search?.trim()
        ? data.filter(f => profileMap.has(f.follower_id))
        : data;

      const followers: FollowUser[] = filteredData.map(f => {
        const profile = profileMap.get(f.follower_id);
        return {
          id: f.id,
          user_id: f.follower_id,
          full_name: profile?.full_name || null,
          avatar_url: profile?.avatar_url || null,
          bio: profile?.bio || null,
          level: profile?.level || 1,
          created_at: f.created_at,
        };
      });

      // Get total count (without search for pagination accuracy)
      const { count } = await supabase
        .from('user_follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId);

      return { data: followers, total: search?.trim() ? followers.length : (count || 0) };
    },
    enabled: !!userId,
  });
};

export const useFollowing = (userId: string | undefined, page: number = 1, search?: string) => {
  return useQuery({
    queryKey: ['following', userId, page, search],
    queryFn: async () => {
      if (!userId) return { data: [], total: 0 };

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Get following with profile info
      const { data, error } = await supabase
        .from('user_follows')
        .select('id, following_id, created_at')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching following:', error);
        return { data: [], total: 0 };
      }

      // Fetch profiles for following
      const followingIds = data?.map(f => f.following_id) || [];
      
      if (followingIds.length === 0) {
        return { data: [], total: 0 };
      }

      let profileQuery = supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, bio, level')
        .in('user_id', followingIds);

      // Apply search filter if provided
      if (search && search.trim()) {
        profileQuery = profileQuery.ilike('full_name', `%${search.trim()}%`);
      }

      const { data: profiles } = await profileQuery;
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      // Filter data based on search results
      const filteredData = search?.trim()
        ? data.filter(f => profileMap.has(f.following_id))
        : data;

      const following: FollowUser[] = filteredData.map(f => {
        const profile = profileMap.get(f.following_id);
        return {
          id: f.id,
          user_id: f.following_id,
          full_name: profile?.full_name || null,
          avatar_url: profile?.avatar_url || null,
          bio: profile?.bio || null,
          level: profile?.level || 1,
          created_at: f.created_at,
        };
      });

      // Get total count
      const { count } = await supabase
        .from('user_follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', userId);

      return { data: following, total: search?.trim() ? following.length : (count || 0) };
    },
    enabled: !!userId,
  });
};

// Get just the count of followers
export const useFollowersCount = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['followers-count', userId],
    queryFn: async () => {
      if (!userId) return 0;

      const { count, error } = await supabase
        .from('user_follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (error) {
        console.error('Error fetching followers count:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!userId,
  });
};

// Get just the count of following
export const useFollowingCount = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['following-count', userId],
    queryFn: async () => {
      if (!userId) return 0;

      const { count, error } = await supabase
        .from('user_follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (error) {
        console.error('Error fetching following count:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!userId,
  });
};

export const useIsFollowing = (targetUserId: string | undefined) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['is-following', user?.id, targetUserId],
    queryFn: async () => {
      if (!user?.id || !targetUserId || user.id === targetUserId) return false;

      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (error) {
        console.error('Error checking follow status:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
  });
};

export const useToggleFollow = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetUserId, isFollowing }: { targetUserId: string; isFollowing: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (user.id === targetUserId) throw new Error('Cannot follow yourself');

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId,
          });

        if (error) throw error;

        // Log activity
        await supabase.from('user_activities').insert({
          user_id: user.id,
          activity_type: 'follow',
          target_type: 'user',
          target_id: targetUserId,
        });

        // Create notification for the followed user
        const { data: followerProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();

        await supabase.from('notifications').insert({
          user_id: targetUserId,
          type: 'follow',
          title: 'Người theo dõi mới',
          message: `${followerProfile?.full_name || 'Ai đó'} đã bắt đầu theo dõi bạn`,
          actor_id: user.id,
          target_type: 'user',
          target_id: user.id,
        });
      }

      return !isFollowing;
    },
    onSuccess: (_, { targetUserId }) => {
      queryClient.invalidateQueries({ queryKey: ['is-following', user?.id, targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['followers', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['followers-count', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['following-count', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['member-stats', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['member-stats', user?.id] });
    },
    onError: (error) => {
      console.error('Follow error:', error);
      toast.error('Có lỗi xảy ra');
    },
  });
};

// Consolidated hook for follow functionality
export const useFollow = (userId: string) => {
  const { user } = useAuth();
  const { data: isFollowing, isLoading: isCheckingFollow } = useIsFollowing(userId);
  const { data: followersCount } = useFollowersCount(userId);
  const { data: followingCount } = useFollowingCount(userId);
  const toggleFollow = useToggleFollow();

  return {
    isFollowing: isFollowing ?? false,
    followersCount: followersCount ?? 0,
    followingCount: followingCount ?? 0,
    isLoading: isCheckingFollow || toggleFollow.isPending,
    isSelf: user?.id === userId,
    follow: () => toggleFollow.mutate({ targetUserId: userId, isFollowing: false }),
    unfollow: () => toggleFollow.mutate({ targetUserId: userId, isFollowing: true }),
    toggle: () => toggleFollow.mutate({ targetUserId: userId, isFollowing: isFollowing ?? false }),
  };
};

// Get list of users that the current user is following (for feed filtering)
export const useFollowingIds = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['following-ids', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (error) {
        console.error('Error fetching following ids:', error);
        return [];
      }

      return data.map(f => f.following_id);
    },
    enabled: !!user?.id,
  });
};
