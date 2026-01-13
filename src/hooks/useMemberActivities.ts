import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type ActivityType = Database['public']['Enums']['activity_type'];

export interface Activity {
  id: string;
  activity_type: ActivityType;
  target_type: string | null;
  target_id: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
  points_earned: number | null;
}

export interface ActivityDay {
  date: string;
  count: number;
  level: number; // 0-4 for heatmap intensity
}

const PAGE_SIZE = 20;

export const useMemberActivities = (userId: string | undefined) => {
  return useInfiniteQuery({
    queryKey: ['member-activities', userId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) return { data: [], nextPage: null };

      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching activities:', error);
        return { data: [], nextPage: null };
      }

      const activities: Activity[] = (data || []).map(item => ({
        id: item.id,
        activity_type: item.activity_type,
        target_type: item.target_type,
        target_id: item.target_id,
        created_at: item.created_at,
        metadata: item.metadata as Record<string, unknown> | null,
        points_earned: item.points_earned,
      }));

      return {
        data: activities,
        nextPage: data && data.length === PAGE_SIZE ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!userId,
  });
};

// Hook for heatmap data - last 12 months
export const useMemberActivityHeatmap = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['member-activity-heatmap', userId],
    queryFn: async (): Promise<ActivityDay[]> => {
      if (!userId) return [];

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { data, error } = await supabase
        .from('user_activities')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', oneYearAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching activity heatmap:', error);
        return [];
      }

      // Group by date
      const countsByDate: Record<string, number> = {};
      (data || []).forEach(item => {
        const date = item.created_at.split('T')[0];
        countsByDate[date] = (countsByDate[date] || 0) + 1;
      });

      // Find max for normalization
      const maxCount = Math.max(...Object.values(countsByDate), 1);

      // Generate all days in the last year
      const days: ActivityDay[] = [];
      const today = new Date();
      const current = new Date(oneYearAgo);

      while (current <= today) {
        const dateStr = current.toISOString().split('T')[0];
        const count = countsByDate[dateStr] || 0;
        
        // Calculate level (0-4)
        let level = 0;
        if (count > 0) {
          const ratio = count / maxCount;
          if (ratio <= 0.25) level = 1;
          else if (ratio <= 0.5) level = 2;
          else if (ratio <= 0.75) level = 3;
          else level = 4;
        }

        days.push({ date: dateStr, count, level });
        current.setDate(current.getDate() + 1);
      }

      return days;
    },
    enabled: !!userId,
  });
};
