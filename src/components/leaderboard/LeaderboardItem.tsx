import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, ChevronRight, Star } from 'lucide-react';
import { LeaderboardEntry, LeaderboardPeriod } from '@/hooks/useLeaderboard';
import { LevelBadge } from '@/components/community/LevelBadge';
import { StatusIndicator } from '@/components/members/StatusIndicator';
import { useLanguage } from '@/i18n/LanguageContext';
import { getLevelColor } from '@/utils/levelConfig';
import { cn } from '@/lib/utils';

export interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  period?: LeaderboardPeriod;
}

// Level stars based on tier
const getLevelStars = (level: number): number => {
  if (level >= 7) return 3; // Purple/Gold tier
  if (level >= 5) return 2; // Blue tier
  if (level >= 3) return 1; // Green tier
  return 0; // Gray tier (no stars)
};

// Top 3 styling
const getTopThreeStyles = (rank: number): string => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent border-yellow-400/40';
    case 2:
      return 'bg-gradient-to-r from-gray-300/15 via-gray-200/5 to-transparent border-gray-300/40';
    case 3:
      return 'bg-gradient-to-r from-amber-600/10 via-amber-500/5 to-transparent border-amber-600/30';
    default:
      return 'bg-card';
  }
};

export const LeaderboardItem = React.memo(function LeaderboardItem({ 
  entry, 
  isCurrentUser = false,
  period = 'all'
}: LeaderboardItemProps) {
  const { formatNumber, t } = useLanguage();

  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300/20 flex items-center justify-center">
            <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
            <Award className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm sm:text-base font-medium text-muted-foreground">
              {rank}
            </span>
          </div>
        );
    }
  };

  const isTopThree = entry.rank <= 3;
  const starCount = getLevelStars(entry.level);
  const pointsDisplay = period !== 'all' 
    ? `+${formatNumber(entry.points)}` 
    : formatNumber(entry.points);

  return (
    <Link
      to={`/members/${entry.userId}`}
      className={cn(
        'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all group',
        'hover:bg-accent/50 hover:border-accent',
        isTopThree && getTopThreeStyles(entry.rank),
        !isTopThree && 'bg-card',
        isCurrentUser && 'ring-2 ring-primary/50 bg-primary/5 border-primary/30'
      )}
    >
      {/* Rank */}
      <div className="flex-shrink-0">
        {getRankDisplay(entry.rank)}
      </div>

      {/* Avatar with Status */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
          <AvatarImage src={entry.avatarUrl || undefined} />
          <AvatarFallback>
            {entry.fullName?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        {/* Online Status Indicator */}
        {entry.showOnlineStatus && entry.onlineStatus && (
          <div className="absolute -bottom-0.5 -right-0.5">
            <StatusIndicator status={entry.onlineStatus} size="sm" />
          </div>
        )}
        {/* Level Badge */}
        <div className="absolute -bottom-1 -left-1">
          <LevelBadge level={entry.level} size="sm" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">
            {isCurrentUser ? t.leaderboard?.yourPosition || 'BẠN' : entry.fullName}
          </p>
          {isCurrentUser && (
            <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
              Bạn
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${getLevelColor(entry.level)}`}>
            Lv.{entry.level}
          </span>
          {/* Level Stars */}
          {starCount > 0 && (
            <span className="flex items-center gap-0.5">
              {Array.from({ length: starCount }).map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "h-3 w-3 fill-current",
                    entry.level >= 7 ? "text-yellow-500" : 
                    entry.level >= 5 ? "text-blue-500" : "text-green-500"
                  )} 
                />
              ))}
            </span>
          )}
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {entry.levelName}
          </span>
        </div>
      </div>

      {/* Points */}
      <div className="text-right flex-shrink-0">
        <div className={cn(
          'font-semibold text-sm sm:text-base',
          isTopThree && 'text-primary',
          period !== 'all' && 'text-green-600'
        )}>
          {pointsDisplay}
        </div>
        <div className="text-xs text-muted-foreground">
          {t.common.points}
        </div>
      </div>

      {/* Profile Arrow */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="flex-shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        asChild
      >
        <div>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Button>
    </Link>
  );
});
