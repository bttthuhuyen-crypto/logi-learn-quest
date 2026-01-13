import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Trophy, Medal, Award, Star } from 'lucide-react';
import { MyProgress } from '@/hooks/useMyProgress';
import { useLanguage } from '@/i18n/LanguageContext';
import { getLevelColor } from '@/utils/levelConfig';
import { LevelBadge } from '@/components/community/LevelBadge';

interface MyProgressCardProps {
  progress: MyProgress | null | undefined;
  isLoading: boolean;
}

export function MyProgressCard({ progress, isLoading }: MyProgressCardProps) {
  const { t, formatNumber } = useLanguage();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          {t.leaderboard.yourProgress || 'Tiến độ của bạn'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarImage src={progress.avatarUrl || undefined} />
              <AvatarFallback className="text-lg">
                {progress.fullName?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              <LevelBadge level={progress.level} size="sm" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{progress.fullName}</h3>
            <p className={`text-sm ${getLevelColor(progress.level)}`}>
              Lv.{progress.level} - {progress.levelName}
            </p>
            <div className="flex items-center gap-1 text-primary font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{formatNumber(progress.points)} {t.common.points}</span>
            </div>
          </div>
        </div>

        {/* Progress to next level */}
        {!progress.isMaxLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t.leaderboard.pointsToNext || 'Tiến độ lên level'}
              </span>
              <span className="font-medium">
                Lv.{progress.level + 1}
              </span>
            </div>
            <Progress value={progress.progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {formatNumber(progress.pointsToNextLevel)} {t.common.points} nữa để lên level
            </p>
          </div>
        )}

        {progress.isMaxLevel && (
          <div className="text-center py-2 px-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <span className="text-sm font-medium text-yellow-600">
              🏆 Bạn đã đạt level cao nhất!
            </span>
          </div>
        )}

        {/* Ranks */}
        <div className="grid grid-cols-3 gap-2">
          <RankCard
            label={t.leaderboard.last7Days}
            rank={progress.rank7d}
            icon={<Trophy className="h-4 w-4" />}
          />
          <RankCard
            label={t.leaderboard.last30Days}
            rank={progress.rank30d}
            icon={<Medal className="h-4 w-4" />}
          />
          <RankCard
            label={t.leaderboard.allTime}
            rank={progress.rankAll}
            icon={<Award className="h-4 w-4" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function RankCard({ 
  label, 
  rank, 
  icon 
}: { 
  label: string; 
  rank: number; 
  icon: React.ReactNode;
}) {
  const isTopRank = rank > 0 && rank <= 3;
  
  return (
    <div className={`
      text-center p-2 rounded-lg border
      ${isTopRank ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border'}
    `}>
      <div className={`flex justify-center mb-1 ${isTopRank ? 'text-primary' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      <div className={`text-lg font-bold ${isTopRank ? 'text-primary' : ''}`}>
        {rank > 0 ? `#${rank}` : '-'}
      </div>
      <div className="text-[10px] text-muted-foreground truncate">
        {label}
      </div>
    </div>
  );
}
