import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { LeaderboardEntry } from '@/hooks/useLeaderboard';
import { LevelBadge } from '@/components/community/LevelBadge';
import { useLanguage } from '@/i18n/LanguageContext';
import { getLevelColor } from '@/utils/levelConfig';
import { cn } from '@/lib/utils';

export interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

export const LeaderboardItem = React.memo(function LeaderboardItem({ 
  entry, 
  isCurrentUser = false 
}: LeaderboardItemProps) {
  const { formatNumber, t } = useLanguage();

  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-300/20 flex items-center justify-center">
            <Medal className="h-5 w-5 text-gray-400" />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center">
            <Award className="h-5 w-5 text-amber-600" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">
              {rank}
            </span>
          </div>
        );
    }
  };

  const isTopThree = entry.rank <= 3;

  return (
    <Link
      to={`/members/${entry.userId}`}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border transition-all',
        'hover:bg-accent/50 hover:border-accent',
        isTopThree && 'bg-gradient-to-r from-primary/5 to-transparent border-primary/20',
        !isTopThree && 'bg-card',
        isCurrentUser && 'ring-2 ring-primary/50 bg-primary/5'
      )}
    >
      {/* Rank */}
      <div className="flex-shrink-0">
        {getRankDisplay(entry.rank)}
      </div>

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={entry.avatarUrl || undefined} />
          <AvatarFallback>
            {entry.fullName?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1">
          <LevelBadge level={entry.level} size="sm" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{entry.fullName}</p>
        <p className={`text-sm ${getLevelColor(entry.level)}`}>
          Lv.{entry.level} - {entry.levelName}
        </p>
      </div>

      {/* Points */}
      <div className="text-right flex-shrink-0">
        <div className={`font-semibold ${isTopThree ? 'text-primary' : ''}`}>
          {formatNumber(entry.points)}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
          <TrendingUp className="h-3 w-3" />
          {t.common.points}
        </div>
      </div>
    </Link>
  );
});
