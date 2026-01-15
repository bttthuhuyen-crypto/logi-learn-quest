import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateProgress, getLevelName, LevelConfig, DEFAULT_LEVEL_CONFIG } from '@/utils/levelConfig';

export interface UserProgress {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  points: number;
  level: number;
  levelName: string;
  points7d: number;
  points30d: number;
  rank7d: number;
  rank30d: number;
  rankAll: number;
  pointsToNextLevel: number;
  nextLevelPoints: number;
  progressPercent: number;
  isMaxLevel: boolean;
}

/**
 * Hook to fetch progress data for any user (not just current user)
 */
export function useUserProgress(userId: string | undefined, communityId?: string, levelConfig?: LevelConfig | null) {
  return useQuery({
    queryKey: ['user-progress', userId, communityId],
    queryFn: async (): Promise<UserProgress | null> => {
      if (!userId) return null;

      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, level, points')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      // Fetch community member data if communityId provided
      let memberData = null;
      if (communityId) {
        const { data } = await supabase
          .from('community_members')
          .select('points, points_7d, points_30d, level')
          .eq('user_id', userId)
          .eq('community_id', communityId)
          .maybeSingle();
        memberData = data;
      }

      // Get ranks using RPC
      let rank7d = 0;
      let rank30d = 0;
      let rankAll = 0;

      if (communityId) {
        const [r7d, r30d, rAll] = await Promise.all([
          supabase.rpc('get_user_rank', { 
            p_user_id: userId, 
            p_community_id: communityId, 
            p_period: '7d' 
          }),
          supabase.rpc('get_user_rank', { 
            p_user_id: userId, 
            p_community_id: communityId, 
            p_period: '30d' 
          }),
          supabase.rpc('get_user_rank', { 
            p_user_id: userId, 
            p_community_id: communityId, 
            p_period: 'all' 
          }),
        ]);

        rank7d = r7d.data || 0;
        rank30d = r30d.data || 0;
        rankAll = rAll.data || 0;
      }

      const points = memberData?.points || profile?.points || 0;
      const level = memberData?.level || profile?.level || 1;
      const config = levelConfig || DEFAULT_LEVEL_CONFIG;
      const progress = calculateProgress(points, level, config);

      return {
        userId,
        fullName: profile?.full_name || '',
        avatarUrl: profile?.avatar_url || null,
        points,
        level,
        levelName: getLevelName(level, config),
        points7d: memberData?.points_7d || 0,
        points30d: memberData?.points_30d || 0,
        rank7d,
        rank30d,
        rankAll,
        ...progress,
      };
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
}
