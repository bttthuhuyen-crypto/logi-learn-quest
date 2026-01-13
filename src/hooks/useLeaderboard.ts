import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getLevelName, LevelConfig, DEFAULT_LEVEL_CONFIG } from '@/utils/levelConfig';

export type LeaderboardPeriod = '7d' | '30d' | 'all';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  points: number;
  level: number;
  levelName: string;
  onlineStatus?: 'online' | 'away' | 'offline';
  showOnlineStatus?: boolean;
}

interface UseLeaderboardOptions {
  period: LeaderboardPeriod;
  communityId?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  levelConfig?: LevelConfig | null;
}

interface LeaderboardResult {
  entries: LeaderboardEntry[];
  totalCount: number;
  hasMore: boolean;
}

export function useLeaderboard(options: UseLeaderboardOptions) {
  const { 
    period, 
    communityId, 
    page = 1, 
    pageSize = 20, 
    search = '',
    levelConfig 
  } = options;

  return useQuery({
    queryKey: ['leaderboard', period, communityId, page, search],
    queryFn: async (): Promise<LeaderboardResult> => {
      const config = levelConfig || DEFAULT_LEVEL_CONFIG;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Determine sort column based on period
      const sortColumn = period === '7d' ? 'points_7d' : period === '30d' ? 'points_30d' : 'points';

      // First get community members with sorting
      let query = supabase
        .from('community_members')
        .select(`
          user_id,
          points,
          points_7d,
          points_30d,
          level
        `, { count: 'exact' })
        .eq('status', 'active');

      if (communityId) {
        query = query.eq('community_id', communityId);
      }

      // Order by the appropriate points column
      query = query.order(sortColumn, { ascending: false, nullsFirst: false });
      query = query.range(from, to);

      const { data: membersData, count, error } = await query;

      if (error) {
        console.error('Leaderboard query error:', error);
        throw error;
      }

      if (!membersData || membersData.length === 0) {
        return { entries: [], totalCount: 0, hasMore: false };
      }

      // Get user IDs for profile lookup
      const userIds = membersData.map(m => m.user_id);

      // Fetch profiles and presence in parallel
      const [profilesResult, presenceResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds),
        supabase
          .from('user_presence')
          .select('user_id, status, show_online_status')
          .in('user_id', userIds)
      ]);

      let profilesData = profilesResult.data || [];
      const presenceData = presenceResult.data || [];

      // Filter by search if provided
      if (search.trim()) {
        profilesData = profilesData.filter(p => 
          p.full_name?.toLowerCase().includes(search.trim().toLowerCase())
        );
      }

      // Create maps
      const profilesMap = new Map(
        profilesData.map(p => [p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url }])
      );

      const presenceMap = new Map(
        presenceData.map(p => [p.user_id, { status: p.status, show_online_status: p.show_online_status }])
      );

      // If searching, filter members to only include those with matching profiles
      let filteredMembers = membersData;
      if (search.trim()) {
        filteredMembers = membersData.filter(m => profilesMap.has(m.user_id));
      }

      const entries: LeaderboardEntry[] = filteredMembers.map((item, index) => {
        const profile = profilesMap.get(item.user_id);
        const presence = presenceMap.get(item.user_id);
        const points = period === '7d' 
          ? (item.points_7d || 0)
          : period === '30d' 
            ? (item.points_30d || 0) 
            : (item.points || 0);

        return {
          rank: from + index + 1,
          userId: item.user_id,
          fullName: profile?.full_name || 'Anonymous',
          avatarUrl: profile?.avatar_url || null,
          points,
          level: item.level || 1,
          levelName: getLevelName(item.level || 1, config),
          onlineStatus: (presence?.status as 'online' | 'away' | 'offline') || 'offline',
          showOnlineStatus: presence?.show_online_status ?? true,
        };
      });

      return {
        entries,
        totalCount: count || 0,
        hasMore: (count || 0) > to + 1,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
