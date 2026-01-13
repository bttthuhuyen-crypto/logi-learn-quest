import React from 'react';
import { BarChart3, Users, MessageSquare, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export const CommunityStats: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => {
      const [membersRes, postsRes, commentsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
      ]);

      return {
        members: membersRes.count || 0,
        posts: postsRes.count || 0,
        comments: commentsRes.count || 0,
      };
    },
  });

  const statItems = [
    {
      icon: Users,
      label: 'Thành viên',
      value: stats?.members || 0,
    },
    {
      icon: MessageSquare,
      label: 'Bài viết',
      value: stats?.posts || 0,
    },
    {
      icon: Heart,
      label: 'Bình luận',
      value: stats?.comments || 0,
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Thống kê cộng đồng</h3>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center p-2">
              <Skeleton className="h-6 w-12 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="text-center p-2 rounded-lg bg-muted/50"
            >
              <item.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{item.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
