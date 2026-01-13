import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Gift, Check, Star, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  onLevelClick?: (level: number) => void;
}

export function LevelRewardsPreview({
  currentLevel,
  levelConfig,
  rewards = [],
  isLoading = false,
  onViewDetails,
  onLevelClick,
}: LevelRewardsPreviewProps) {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const config = levelConfig || DEFAULT_LEVEL_CONFIG;

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
  }, {} as Record<number, Array<{ type: 'course_unlock' | 'chat_access' | 'badge' | 'custom'; description: string | null }>>);

  // Update scroll button visibility
  const updateScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Auto-scroll to current level on mount
  useEffect(() => {
    if (scrollRef.current && currentLevel > 1 && !isLoading) {
      const cardWidth = 128; // w-32 = 128px
      const gap = 12; // gap-3 = 12px
      const scrollPosition = (currentLevel - 1) * (cardWidth + gap);
      
      // Center the current level card
      const containerWidth = scrollRef.current.offsetWidth;
      const centeredPosition = scrollPosition - (containerWidth / 2) + (cardWidth / 2);
      
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          left: Math.max(0, centeredPosition),
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [currentLevel, isLoading]);

  // Listen to scroll events
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollState);
      updateScrollState();
      return () => container.removeEventListener('scroll', updateScrollState);
    }
  }, [isLoading]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-32 h-36 rounded-xl flex-shrink-0" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            {t.leaderboard.levelRewards || 'Phần thưởng theo cấp độ'}
          </CardTitle>
          {onViewDetails && (
            <Button variant="ghost" size="sm" onClick={onViewDetails}>
              {t.leaderboard.viewDetails || 'Xem chi tiết'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative">
        {/* Left scroll button - desktop only */}
        {canScrollLeft && (
          <Button
            variant="outline"
            size="icon"
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-md bg-background/95 backdrop-blur-sm"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Right scroll button - desktop only */}
        {canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-md bg-background/95 backdrop-blur-sm"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Left fade gradient */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-16 w-8 bg-gradient-to-r from-card to-transparent pointer-events-none z-[5]" />
        )}

        {/* Right fade gradient */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-16 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none z-[5]" />
        )}

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:px-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
            <LevelCard
              key={level}
              level={level}
              name={getLevelName(level, config)}
              pointsRequired={getPointsForLevel(level, config)}
              rewards={rewardsByLevel[level] || []}
              currentLevel={currentLevel}
              onClick={() => onLevelClick?.(level)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 md:gap-6 pt-2 border-t">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="h-2.5 w-2.5 text-green-500" />
            </div>
            <span>Đã mở khóa</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Star className="h-2.5 w-2.5 text-primary fill-primary" />
            </div>
            <span>Hiện tại</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
              <Lock className="h-2.5 w-2.5 text-muted-foreground" />
            </div>
            <span>Chưa mở khóa</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
