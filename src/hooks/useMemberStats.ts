import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MemberStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  points: number;
}

export const useMemberStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['member-stats', userId],
    queryFn: async (): Promise<MemberStats> => {
      if (!userId) {
        return { postsCount: 0, followersCount: 0, followingCount: 0, points: 0 };
      }

      // Fetch all counts in parallel
      const [postsResult, followersResult, followingResult, profileResult] = await Promise.all([
        supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', userId),
        supabase
          .from('user_follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('user_follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', userId),
        supabase
          .from('profiles')
          .select('points')
          .eq('user_id', userId)
          .single(),
      ]);

      return {
        postsCount: postsResult.count || 0,
        followersCount: followersResult.count || 0,
        followingCount: followingResult.count || 0,
        points: profileResult.data?.points || 0,
      };
    },
    enabled: !!userId,
  });
};
