import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLevelConfig } from '@/hooks/useLevelConfig';
import { getLevelName } from '@/utils/levelConfig';

export type LeaderboardPeriod = '7d' | '30d';

export interface LeaderboardWidgetEntry {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  level: number;
  levelName: string;
  points: number;
  periodPoints: number;
  rank: number;
}

interface UseLeaderboardWidgetOptions {
  communityId?: string;
  period: LeaderboardPeriod;
  limit: number;
}

interface LeaderboardWidgetResult {
  topMembers: LeaderboardWidgetEntry[];
  currentUser: LeaderboardWidgetEntry | null;
  currentUserInTop: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useLeaderboardWidget(options: UseLeaderboardWidgetOptions): LeaderboardWidgetResult {
  const { period, limit, communityId } = options;
  const { user } = useAuth();
  const { data: levelConfigData } = useLevelConfig(communityId);
  const levelConfig = levelConfigData?.config || null;

  const pointsColumn = period === '7d' ? 'points_7d' : 'points_30d';

  const { data, isLoading, error } = useQuery({
    queryKey: ['leaderboard-widget', communityId, period, limit, user?.id],
    queryFn: async () => {
      // Fetch top N members
      let query = supabase
        .from('community_members')
        .select(`
          user_id,
          level,
          points,
          points_7d,
          points_30d,
          profiles!inner(full_name, avatar_url)
        `)
        .order(pointsColumn, { ascending: false, nullsFirst: false })
        .limit(limit);

      if (communityId) {
        query = query.eq('community_id', communityId);
      }

      const { data: topData, error: topError } = await query;
      if (topError) throw topError;

      const topMembers: LeaderboardWidgetEntry[] = (topData || []).map((member, index) => {
        const profile = member.profiles as unknown as { full_name: string | null; avatar_url: string | null };
        const periodPoints = period === '7d' ? (member.points_7d || 0) : (member.points_30d || 0);
        
        return {
          userId: member.user_id,
          fullName: profile?.full_name || 'Anonymous',
          avatarUrl: profile?.avatar_url,
          level: member.level || 1,
          levelName: getLevelName(member.level || 1, levelConfig),
          points: member.points || 0,
          periodPoints,
          rank: index + 1,
        };
      });

      // Check if current user is in top N
      let currentUser: LeaderboardWidgetEntry | null = null;
      let currentUserInTop = false;

      if (user?.id) {
        currentUserInTop = topMembers.some(m => m.userId === user.id);

        if (!currentUserInTop) {
          // Fetch current user's data and rank
          let userQuery = supabase
            .from('community_members')
            .select(`
              user_id,
              level,
              points,
              points_7d,
              points_30d,
              profiles!inner(full_name, avatar_url)
            `)
            .eq('user_id', user.id);

          if (communityId) {
            userQuery = userQuery.eq('community_id', communityId);
          }

          const { data: userData } = await userQuery.maybeSingle();

          if (userData) {
            const userPeriodPoints = period === '7d' ? (userData.points_7d || 0) : (userData.points_30d || 0);
            
            // Get user's rank by counting members with more points
            let rankQuery = supabase
              .from('community_members')
              .select('user_id', { count: 'exact', head: true })
              .gt(pointsColumn, userPeriodPoints);

            if (communityId) {
              rankQuery = rankQuery.eq('community_id', communityId);
            }

            const { count } = await rankQuery;
            const userProfile = userData.profiles as unknown as { full_name: string | null; avatar_url: string | null };

            currentUser = {
              userId: userData.user_id,
              fullName: userProfile?.full_name || 'Bạn',
              avatarUrl: userProfile?.avatar_url,
              level: userData.level || 1,
              levelName: getLevelName(userData.level || 1, levelConfig),
              points: userData.points || 0,
              periodPoints: userPeriodPoints,
              rank: (count || 0) + 1,
            };
          }
        } else {
          // Current user is in top, get their entry
          currentUser = topMembers.find(m => m.userId === user.id) || null;
        }
      }

      return { topMembers, currentUser, currentUserInTop };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes cache
  });

  return {
    topMembers: data?.topMembers || [],
    currentUser: data?.currentUser || null,
    currentUserInTop: data?.currentUserInTop || false,
    isLoading,
    error: error as Error | null,
  };
}
