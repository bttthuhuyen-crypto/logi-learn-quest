import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, ChevronRight, Star, Crown } from 'lucide-react';
import { LevelBadge } from '@/components/community/LevelBadge';
import { StatusIndicator } from '@/components/members/StatusIndicator';
import { useLanguage } from '@/i18n/LanguageContext';
import { getLevelColor } from '@/utils/levelConfig';
import { cn } from '@/lib/utils';

export interface LeaderboardRowMember {
  userId: string;
  fullName: string;
  username?: string;
  avatarUrl: string | null;
  level: number;
  levelName: string;
  points: number;
  isOnline?: boolean;
  showOnlineStatus?: boolean;
}

export interface LeaderboardRowProps {
  rank: number;
  member: LeaderboardRowMember;
  period: '7d' | '30d' | 'all';
  isCurrentUser: boolean;
  variant: 'top3' | 'normal';
}

// Level indicator: stars for 3-8, crown for 9
const getLevelIndicator = (level: number) => {
  if (level === 9) return { type: 'crown' as const, count: 1 };
  if (level >= 7) return { type: 'star' as const, count: 3 };
  if (level >= 5) return { type: 'star' as const, count: 2 };
  if (level >= 3) return { type: 'star' as const, count: 1 };
  return { type: 'none' as const, count: 0 };
};

// Top 3 gradient backgrounds
const getTop3Gradient = (rank: number): string => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent border-yellow-400/40';
    case 2:
      return 'bg-gradient-to-r from-gray-300/15 via-gray-200/5 to-transparent border-gray-300/40';
    case 3:
      return 'bg-gradient-to-r from-amber-600/10 via-amber-500/5 to-transparent border-amber-600/30';
    default:
      return '';
  }
};

// Get star/indicator color based on level
const getIndicatorColor = (level: number): string => {
  if (level === 9) return 'text-yellow-500';
  if (level >= 7) return 'text-purple-500';
  if (level >= 5) return 'text-blue-500';
  return 'text-green-500';
};

export const LeaderboardRow = React.memo(function LeaderboardRow({
  rank,
  member,
  period,
  isCurrentUser,
  variant,
}: LeaderboardRowProps) {
  const { formatNumber, t } = useLanguage();
  const indicator = getLevelIndicator(member.level);
  const pointsDisplay = period !== 'all' 
    ? `+${formatNumber(member.points)}` 
    : formatNumber(member.points);

  // Rank display with medals
  const renderRank = () => {
    const isTop3Variant = variant === 'top3';
    const medalSize = isTop3Variant ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-5 w-5 sm:h-6 sm:w-6';
    const containerSize = isTop3Variant 
      ? 'w-14 sm:w-16 flex flex-col items-center gap-1' 
      : 'w-10 sm:w-12 flex items-center justify-center';

    switch (rank) {
      case 1:
        return (
          <div className={containerSize}>
            <div className="rounded-full bg-yellow-500/20 p-1.5 sm:p-2">
              <Trophy className={cn(medalSize, 'text-yellow-500')} />
            </div>
            {isTop3Variant && (
              <span className="text-lg sm:text-xl font-bold text-yellow-600">1</span>
            )}
          </div>
        );
      case 2:
        return (
          <div className={containerSize}>
            <div className="rounded-full bg-gray-300/20 p-1.5 sm:p-2">
              <Medal className={cn(medalSize, 'text-gray-400')} />
            </div>
            {isTop3Variant && (
              <span className="text-lg sm:text-xl font-bold text-gray-500">2</span>
            )}
          </div>
        );
      case 3:
        return (
          <div className={containerSize}>
            <div className="rounded-full bg-amber-600/20 p-1.5 sm:p-2">
              <Award className={cn(medalSize, 'text-amber-600')} />
            </div>
            {isTop3Variant && (
              <span className="text-lg sm:text-xl font-bold text-amber-700">3</span>
            )}
          </div>
        );
      default:
        return (
          <div className={containerSize}>
            <span className="text-base sm:text-lg font-bold text-muted-foreground">
              {rank}
            </span>
          </div>
        );
    }
  };

  // Level indicator (stars or crown)
  const renderLevelIndicator = () => {
    if (indicator.type === 'none') return null;

    const color = getIndicatorColor(member.level);

    if (indicator.type === 'crown') {
      return <Crown className={cn('h-4 w-4 fill-current', color)} />;
    }

    return (
      <span className="flex items-center gap-0.5">
        {Array.from({ length: indicator.count }).map((_, i) => (
          <Star key={i} className={cn('h-3 w-3 fill-current', color)} />
        ))}
      </span>
    );
  };

  // Current user highlight styles
  const currentUserStyles = isCurrentUser 
    ? 'ring-2 ring-blue-400/50 bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700'
    : '';

  // Top 3 variant (larger, 2-row layout)
  if (variant === 'top3') {
    return (
      <Link
        to={`/members/${member.userId}`}
        className={cn(
          'block p-4 sm:p-5 rounded-xl border transition-all group',
          'hover:shadow-md hover:border-accent',
          getTop3Gradient(rank),
          currentUserStyles
        )}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Medal + Rank */}
          {renderRank()}

          {/* Larger Avatar with Status */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-2 ring-background">
              <AvatarImage src={member.avatarUrl || undefined} />
              <AvatarFallback className="text-lg sm:text-xl">
                {member.fullName?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            {/* Online Status */}
            {member.showOnlineStatus && member.isOnline !== undefined && (
              <div className="absolute -bottom-0.5 -right-0.5">
                <StatusIndicator 
                  status={member.isOnline ? 'online' : 'offline'} 
                  size="sm" 
                />
              </div>
            )}
            {/* Level Badge */}
            <div className="absolute -bottom-1 -left-1">
              <LevelBadge level={member.level} size="sm" />
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-base sm:text-lg truncate">
                {member.fullName}
              </p>
              {isCurrentUser && (
                <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">
                  Bạn
                </span>
              )}
            </div>
            {member.username && (
              <p className="text-sm text-muted-foreground">@{member.username}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('text-sm font-medium', getLevelColor(member.level))}>
                Level {member.level}
              </span>
              {renderLevelIndicator()}
              <span className="text-sm text-muted-foreground hidden sm:inline">
                "{member.levelName}"
              </span>
            </div>
          </div>

          {/* Points + Action */}
          <div className="text-right flex flex-col items-end gap-2">
            <div>
              <span className={cn(
                'text-lg sm:text-xl font-bold',
                period !== 'all' ? 'text-green-600 dark:text-green-400' : 'text-primary'
              )}>
                {pointsDisplay}
              </span>
              <span className="text-sm text-muted-foreground block">
                {t.common.points}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              asChild
            >
              <span>
                Profile
                <ChevronRight className="h-4 w-4 ml-1" />
              </span>
            </Button>
          </div>
        </div>
      </Link>
    );
  }

  // Normal variant (compact single row)
  return (
    <Link
      to={`/members/${member.userId}`}
      className={cn(
        'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all group',
        'hover:bg-accent/50 hover:border-accent bg-card',
        currentUserStyles
      )}
    >
      {/* Rank */}
      {renderRank()}

      {/* Avatar with Status */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
          <AvatarImage src={member.avatarUrl || undefined} />
          <AvatarFallback>
            {member.fullName?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        {/* Online Status */}
        {member.showOnlineStatus && member.isOnline !== undefined && (
          <div className="absolute -bottom-0.5 -right-0.5">
            <StatusIndicator 
              status={member.isOnline ? 'online' : 'offline'} 
              size="sm" 
            />
          </div>
        )}
        {/* Level Badge */}
        <div className="absolute -bottom-1 -left-1">
          <LevelBadge level={member.level} size="sm" />
        </div>
      </div>

      {/* Name + Username */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{member.fullName}</p>
          {isCurrentUser && (
            <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">
              Bạn
            </span>
          )}
        </div>
        {member.username && (
          <p className="text-xs text-muted-foreground">@{member.username}</p>
        )}
        <div className="flex items-center gap-2">
          <span className={cn('text-sm', getLevelColor(member.level))}>
            Lv.{member.level}
          </span>
          {renderLevelIndicator()}
          <span className="text-xs text-muted-foreground hidden sm:inline">
            "{member.levelName}"
          </span>
        </div>
      </div>

      {/* Points */}
      <div className="text-right flex-shrink-0">
        <div className={cn(
          'font-semibold text-sm sm:text-base',
          period !== 'all' ? 'text-green-600 dark:text-green-400' : 'text-foreground'
        )}>
          {pointsDisplay}
        </div>
        <div className="text-xs text-muted-foreground">
          {t.common.points}
        </div>
      </div>

      {/* Profile Arrow */}
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
});
