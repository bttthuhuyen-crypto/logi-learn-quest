import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Trophy, Medal, Award, Star, TrendingUp, ChartBar } from 'lucide-react';
import { MyProgress } from '@/hooks/useMyProgress';
import { useLanguage } from '@/i18n/LanguageContext';
import { getLevelColor, getLevelName, DEFAULT_LEVEL_CONFIG } from '@/utils/levelConfig';
import { LevelBadge } from '@/components/community/LevelBadge';
import { cn } from '@/lib/utils';

interface MyProgressCardProps {
  progress: MyProgress | null | undefined;
  isLoading: boolean;
  onRankClick?: (period: '7d' | '30d' | 'all') => void;
  variant?: 'default' | 'compact';
}

export function MyProgressCard({ progress, isLoading, onRankClick, variant = 'default' }: MyProgressCardProps) {
  const isCompact = variant === 'compact';
  const { t, formatNumber } = useLanguage();
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Animate progress bar on mount/update
  useEffect(() => {
    if (progress?.progressPercent !== undefined) {
      // Reset to 0 first for animation effect
      setAnimatedProgress(0);
      const timer = setTimeout(() => {
        setAnimatedProgress(progress.progressPercent);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress?.progressPercent]);

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className={isCompact ? "p-4 space-y-4" : "p-5 space-y-5"}>
          {/* User Info Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className={isCompact ? "h-12 w-12 rounded-full" : "h-16 w-16 sm:h-20 sm:w-20 rounded-full"} />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              {!isCompact && <Skeleton className="h-5 w-28" />}
            </div>
          </div>
          
          {/* Progress Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className={isCompact ? "h-2 w-full" : "h-3 w-full"} />
          </div>

          {!isCompact && (
            <>
              <Separator />
              {/* Ranks Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return null;
  }

  const nextLevelName = getLevelName(progress.level + 1, DEFAULT_LEVEL_CONFIG);

  return (
    <Card className="overflow-hidden">
      <CardContent className={isCompact ? "p-4 space-y-4" : "p-5 space-y-5"}>
        {/* User Info Section */}
        <div className={`flex items-center ${isCompact ? 'gap-3' : 'gap-4'}`}>
          {/* Avatar with Level Badge */}
          <div className="relative flex-shrink-0">
            <Avatar className={isCompact ? "h-12 w-12 ring-2 ring-primary/20" : "h-16 w-16 sm:h-20 sm:w-20 ring-2 ring-primary/20"}>
              <AvatarImage src={progress.avatarUrl || undefined} />
              <AvatarFallback className={`font-semibold bg-gradient-to-br from-primary/20 to-primary/10 ${isCompact ? 'text-base' : 'text-xl sm:text-2xl'}`}>
                {progress.fullName?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              <LevelBadge level={progress.level} size={isCompact ? "sm" : "md"} />
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <h3 className={`font-semibold truncate ${isCompact ? 'text-base' : 'text-lg'}`}>{progress.fullName}</h3>
            <div className={`flex items-center gap-1.5 flex-wrap ${isCompact ? 'text-xs' : ''}`}>
              <span className={cn('font-medium', getLevelColor(progress.level))}>
                Level {progress.level}
              </span>
              <Star className={cn(isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5', getLevelColor(progress.level))} fill="currentColor" />
              <span className={cn('font-medium', getLevelColor(progress.level))}>
                "{progress.levelName}"
              </span>
            </div>
            {/* Total Points */}
            <div className={`flex items-center gap-1.5 text-primary font-semibold ${isCompact ? 'text-sm' : 'text-lg'}`}>
              <Trophy className={isCompact ? "h-3 w-3" : "h-4 w-4"} />
              <span>{formatNumber(progress.points)} {t.common.points}</span>
            </div>
          </div>
        </div>

        {/* Progress to Next Level */}
        {!progress.isMaxLevel ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
                {isCompact ? `Đến Lv.${progress.level + 1}` : `Tiến độ đến Level ${progress.level + 1} "${nextLevelName}":`}
              </span>
              <span className={`font-medium text-primary ${isCompact ? 'text-xs' : 'text-sm'}`}>
                {progress.progressPercent}%
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={animatedProgress} 
                className={`${isCompact ? 'h-2' : 'h-3'} transition-all duration-700 ease-out`}
              />
            </div>
            {!isCompact && (
              <p className="text-xs text-muted-foreground text-center">
                Còn <span className="font-medium text-foreground">{formatNumber(progress.pointsToNextLevel)}</span> điểm nữa ({formatNumber(progress.points)} / {formatNumber(progress.nextLevelPoints)})
              </p>
            )}
          </div>
        ) : (
          <div className={`text-center rounded-lg bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border border-amber-400/30 ${isCompact ? 'py-2 px-3' : 'py-3 px-4'}`}>
            <span className={`font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2 ${isCompact ? 'text-xs' : 'text-sm'}`}>
              <Trophy className={isCompact ? "h-4 w-4" : "h-5 w-5"} />
              🏆 {isCompact ? 'Max Level!' : 'Bạn đã đạt level cao nhất!'}
            </span>
          </div>
        )}

        {/* Ranks Section - hidden in compact mode */}
        {!isCompact && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <ChartBar className="h-4 w-4" />
                📊 Xếp hạng của bạn:
              </h4>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <RankCard
                  label={t.leaderboard.last7Days}
                  rank={progress.rank7d}
                  points={progress.points7d}
                  icon={<Trophy className="h-4 w-4" />}
                  onClick={() => onRankClick?.('7d')}
                />
                <RankCard
                  label={t.leaderboard.last30Days}
                  rank={progress.rank30d}
                  points={progress.points30d}
                  icon={<Medal className="h-4 w-4" />}
                  onClick={() => onRankClick?.('30d')}
                />
                <RankCard
                  label={t.leaderboard.allTime}
                  rank={progress.rankAll}
                  icon={<Award className="h-4 w-4" />}
                  onClick={() => onRankClick?.('all')}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface RankCardProps {
  label: string;
  rank: number;
  points?: number;
  icon: React.ReactNode;
  onClick?: () => void;
}

function RankCard({ label, rank, points, icon, onClick }: RankCardProps) {
  const isTopRank = rank > 0 && rank <= 3;
  const hasRank = rank > 0;
  
  // Determine rank styling
  const getRankStyles = () => {
    if (!hasRank) return 'bg-muted/30 border-border';
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400/20 to-amber-500/20 border-amber-400/50';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300/20 to-gray-400/20 border-gray-400/50';
    if (rank === 3) return 'bg-gradient-to-br from-orange-400/20 to-orange-500/20 border-orange-400/50';
    return 'bg-primary/5 border-primary/20 hover:bg-primary/10';
  };
  
  return (
    <button
      onClick={onClick}
      disabled={!hasRank}
      className={cn(
        'text-center p-3 rounded-xl border transition-all duration-200',
        getRankStyles(),
        hasRank && 'cursor-pointer hover:scale-[1.02] hover:shadow-md active:scale-[0.98]',
        !hasRank && 'cursor-default opacity-60'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'flex justify-center mb-1',
        isTopRank ? 'text-primary' : 'text-muted-foreground'
      )}>
        {icon}
      </div>
      
      {/* Period Label */}
      <div className="text-[10px] sm:text-xs text-muted-foreground mb-1 truncate">
        {label}
      </div>
      
      {/* Rank */}
      <div className={cn(
        'text-lg sm:text-xl font-bold',
        rank === 1 && 'text-amber-500',
        rank === 2 && 'text-gray-500',
        rank === 3 && 'text-orange-500',
        rank > 3 && 'text-foreground',
        !hasRank && 'text-muted-foreground'
      )}>
        {hasRank ? `#${rank}` : '-'}
      </div>
      
      {/* Points earned in period */}
      {points !== undefined && points > 0 && (
        <div className="flex items-center justify-center gap-0.5 text-xs text-primary font-medium">
          <TrendingUp className="h-3 w-3" />
          <span>+{points}</span>
        </div>
      )}
    </button>
  );
}
