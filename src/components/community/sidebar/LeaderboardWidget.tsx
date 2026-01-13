import React from 'react';
import { Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

export const LeaderboardWidget: React.FC = () => {
  const { data: topMembers, isLoading } = useQuery({
    queryKey: ['leaderboard-top5'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, points, level')
        .order('points', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-500/10 text-yellow-600';
      case 1:
        return 'bg-gray-400/10 text-gray-500';
      case 2:
        return 'bg-orange-500/10 text-orange-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Bảng xếp hạng</h3>
        </div>
        <Link to="/leaderboard" className="text-xs text-muted-foreground hover:text-foreground">
          Xem tất cả
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {topMembers?.map((member, index) => (
            <div
              key={member.user_id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankStyle(index)}`}
              >
                {index + 1}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatar_url || ''} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {member.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {member.full_name || 'Anonymous'}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {member.points?.toLocaleString()} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
