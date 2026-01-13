import React, { useState } from 'react';
import { Trophy, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useNavigate } from 'react-router-dom';
import { useLeaderboardWidget, LeaderboardPeriod, LeaderboardWidgetEntry } from '@/hooks/useLeaderboardWidget';
import { useIsMobile } from '@/hooks/use-mobile';
import { LevelBadge } from '@/components/community/LevelBadge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LeaderboardWidgetProps {
  communityId?: string;
  period?: LeaderboardPeriod;
  limit?: number;
  showCurrentUser?: boolean;
  compact?: boolean;
}

const getRankIcon = (rank: number): string | null => {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return null;
  }
};

const getRankBgClass = (rank: number): string => {
  switch (rank) {
    case 1: return 'bg-yellow-500/10 text-yellow-600';
    case 2: return 'bg-gray-400/10 text-gray-500';
    case 3: return 'bg-orange-500/10 text-orange-600';
    default: return 'bg-muted text-muted-foreground';
  }
};

interface WidgetMemberRowProps {
  member: LeaderboardWidgetEntry;
  isCurrentUser?: boolean;
  compact?: boolean;
  onClick: () => void;
}

const WidgetMemberRow: React.FC<WidgetMemberRowProps> = ({
  member,
  isCurrentUser,
  compact,
  onClick,
}) => {
  const rankIcon = getRankIcon(member.rank);
  const avatarSize = compact ? 'h-7 w-7' : 'h-8 w-8';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
        isCurrentUser ? 'bg-primary/5 border border-primary/20' : ''
      }`}
    >
      {/* Rank */}
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getRankBgClass(member.rank)}`}
      >
        {rankIcon || member.rank}
      </span>

      {/* Avatar */}
      <Avatar className={avatarSize}>
        <AvatarImage src={member.avatarUrl || ''} />
        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
          {member.fullName?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>

      {/* Name with tooltip */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`text-sm font-medium truncate ${compact ? 'max-w-[80px]' : 'max-w-[100px]'}`}>
                {isCurrentUser ? 'Bạn' : member.fullName}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{member.fullName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Level badge - hidden in compact mode */}
        {!compact && (
          <LevelBadge level={member.level} size="sm" />
        )}
      </div>

      {/* Points */}
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        +{member.periodPoints.toLocaleString()}{!compact && ' pts'}
      </span>
    </div>
  );
};

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
  communityId,
  period: initialPeriod = '7d',
  limit: propLimit = 5,
  showCurrentUser = true,
  compact: propCompact,
}) => {
  const [period, setPeriod] = useState<LeaderboardPeriod>(initialPeriod);
  const isMobile = useIsMobile();
  const isCompact = propCompact ?? isMobile;
  const effectiveLimit = isCompact ? 3 : propLimit;
  const navigate = useNavigate();

  const { topMembers, currentUser, currentUserInTop, isLoading } = useLeaderboardWidget({
    communityId,
    period,
    limit: effectiveLimit,
  });

  const handleRowClick = (userId: string) => {
    navigate(`/members/${userId}`);
  };

  const handlePeriodChange = (value: string) => {
    setPeriod(value as LeaderboardPeriod);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h3 className="font-semibold text-sm">Bảng xếp hạng</h3>
        </div>

        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="h-7 w-[90px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 ngày</SelectItem>
            <SelectItem value="30d">30 ngày</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: effectiveLimit }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 p-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Top members list */}
          <div className="space-y-1">
            {topMembers.map((member) => (
              <WidgetMemberRow
                key={member.userId}
                member={member}
                isCurrentUser={currentUser?.userId === member.userId}
                compact={isCompact}
                onClick={() => handleRowClick(member.userId)}
              />
            ))}
          </div>

          {/* Current user section (if not in top and showCurrentUser is true) */}
          {showCurrentUser && !currentUserInTop && currentUser && (
            <>
              <Separator className="my-2" />
              <WidgetMemberRow
                member={currentUser}
                isCurrentUser
                compact={isCompact}
                onClick={() => handleRowClick(currentUser.userId)}
              />
            </>
          )}
        </>
      )}

      {/* Footer link */}
      <Link
        to={`/leaderboard?period=${period}`}
        className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-3 pt-3 border-t border-border transition-colors"
      >
        Xem đầy đủ
        <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
};
