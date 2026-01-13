import React, { useEffect } from 'react';
import { BarChart3, Users, Activity, FileText } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/i18n/LanguageContext';

export const CommunityStatsWidget: React.FC = () => {
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  // Fetch total members
  const { data: totalMembers, isLoading: loadingMembers } = useQuery({
    queryKey: ['community-stats-members'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch online count (users with status 'online' and last_seen within 2 minutes)
  const { data: onlineCount, isLoading: loadingOnline } = useQuery({
    queryKey: ['community-stats-online'],
    queryFn: async () => {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from('user_presence')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'online')
        .gte('last_seen_at', twoMinutesAgo);
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch posts this week
  const { data: postsThisWeek, isLoading: loadingPosts } = useQuery({
    queryKey: ['community-stats-posts-week'],
    queryFn: async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo);
      if (error) throw error;
      return count || 0;
    },
  });

  // Subscribe to realtime presence changes
  useEffect(() => {
    const channel = supabase
      .channel('community-stats-presence')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_presence' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['community-stats-online'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const isLoading = loadingMembers || loadingOnline || loadingPosts;

  const stats = [
    {
      icon: Users,
      value: totalMembers || 0,
      label: language === 'vi' ? 'Thành viên' : 'Members',
    },
    {
      icon: Activity,
      value: onlineCount || 0,
      label: language === 'vi' ? 'Đang online' : 'Online',
      highlight: true,
    },
    {
      icon: FileText,
      value: postsThisWeek || 0,
      label: language === 'vi' ? 'Bài tuần này' : 'Posts this week',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">{language === 'vi' ? 'Thống kê' : 'Statistics'}</h3>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center p-3 rounded-lg bg-muted/50">
              <Skeleton className="h-4 w-4 mx-auto mb-2" />
              <Skeleton className="h-6 w-12 mx-auto mb-1" />
              <Skeleton className="h-3 w-14 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-3 rounded-lg bg-muted/50"
            >
              <stat.icon className={`h-4 w-4 mx-auto mb-1 ${
                stat.highlight ? 'text-green-500' : 'text-muted-foreground'
              }`} />
              <p className={`text-lg font-bold ${
                stat.highlight ? 'text-green-500' : ''
              }`}>
                {stat.value.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
