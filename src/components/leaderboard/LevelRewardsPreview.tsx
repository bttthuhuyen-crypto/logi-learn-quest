import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Gift, ExternalLink } from 'lucide-react';
import { LevelCard } from './LevelCard';
import { LevelConfig, DEFAULT_LEVEL_CONFIG, getLevelName, getPointsForLevel } from '@/utils/levelConfig';
import { useLanguage } from '@/i18n/LanguageContext';

interface LevelReward {
  level: number;
  rewardType: 'course_unlock' | 'chat_access' | 'badge' | 'custom';
  description: string | null;
}

interface LevelRewardsPreviewProps {
  currentLevel: number;
  levelConfig?: LevelConfig | null;
  rewards?: LevelReward[];
  isLoading?: boolean;
  onViewDetails?: () => void;
}

export function LevelRewardsPreview({
  currentLevel,
  levelConfig,
  rewards = [],
  isLoading = false,
  onViewDetails,
}: LevelRewardsPreviewProps) {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const config = levelConfig || DEFAULT_LEVEL_CONFIG;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 140;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Group rewards by level
  const rewardsByLevel = rewards.reduce((acc, reward) => {
    if (!acc[reward.level]) {
      acc[reward.level] = [];
    }
    acc[reward.level].push({
      type: reward.rewardType,
      description: reward.description,
    });
    return acc;
  }, {} as Record<number, Array<{ type: string; description: string | null }>>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-32 flex-shrink-0 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            {t.leaderboard.levelRewards || 'Phần thưởng theo cấp'}
          </CardTitle>
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1"
              onClick={onViewDetails}
            >
              {t.leaderboard.viewDetails || 'Xem chi tiết'}
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Scroll buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-md bg-background/80 backdrop-blur-sm"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-md bg-background/80 backdrop-blur-sm"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide px-6 pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {Array.from({ length: 9 }, (_, i) => i + 1).map((level) => (
              <div key={level} className="snap-start">
                <LevelCard
                  level={level}
                  name={getLevelName(level, config)}
                  pointsRequired={getPointsForLevel(level, config)}
                  rewards={rewardsByLevel[level] as any || []}
                  currentLevel={currentLevel}
                  isCompact
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
