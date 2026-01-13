import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { calculateProgress, getLevelName, LevelConfig, DEFAULT_LEVEL_CONFIG } from '@/utils/levelConfig';

export interface MyProgress {
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

export function useMyProgress(communityId?: string, levelConfig?: LevelConfig | null) {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['my-progress', user?.id, communityId],
    queryFn: async (): Promise<MyProgress | null> => {
      if (!user?.id) return null;

      // First get community member data
      let memberData = null;
      if (communityId) {
        const { data } = await supabase
          .from('community_members')
          .select('points, points_7d, points_30d, level')
          .eq('user_id', user.id)
          .eq('community_id', communityId)
          .single();
        memberData = data;
      }

      // Get ranks using RPC
      let rank7d = 0;
      let rank30d = 0;
      let rankAll = 0;

      if (communityId) {
        const [r7d, r30d, rAll] = await Promise.all([
          supabase.rpc('get_user_rank', { 
            p_user_id: user.id, 
            p_community_id: communityId, 
            p_period: '7d' 
          }),
          supabase.rpc('get_user_rank', { 
            p_user_id: user.id, 
            p_community_id: communityId, 
            p_period: '30d' 
          }),
          supabase.rpc('get_user_rank', { 
            p_user_id: user.id, 
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
        userId: user.id,
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
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
  });
}
