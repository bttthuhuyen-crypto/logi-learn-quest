import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Crown, Gift, BookOpen, Award, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLevelColor, getLevelBgColor } from '@/utils/levelConfig';
import { useLevelUpConfetti } from './useConfetti';

export interface LevelReward {
  id: string;
  type: string;
  value: string | null;
  description: string | null;
}

interface LevelUpCelebrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newLevel: number;
  newLevelName: string;
  rewards: LevelReward[];
}

const getLevelStars = (level: number) => {
  if (level >= 9) return { type: 'crown' as const, count: 1 };
  if (level >= 7) return { type: 'star' as const, count: 3 };
  if (level >= 5) return { type: 'star' as const, count: 2 };
  if (level >= 3) return { type: 'star' as const, count: 1 };
  return { type: 'none' as const, count: 0 };
};

const getRewardIcon = (type: string) => {
  switch (type) {
    case 'badge':
      return <Award className="h-4 w-4 text-yellow-500" />;
    case 'course_access':
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    case 'unlock_chat':
      return <Sparkles className="h-4 w-4 text-purple-500" />;
    default:
      return <Gift className="h-4 w-4 text-green-500" />;
  }
};

export function LevelUpCelebrationModal({
  open,
  onOpenChange,
  newLevel,
  newLevelName,
  rewards,
}: LevelUpCelebrationModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const { fire: fireConfetti } = useLevelUpConfetti();

  useEffect(() => {
    if (open) {
      // Animation sequence
      fireConfetti();
      
      const contentTimer = setTimeout(() => setShowContent(true), 100);
      const badgeTimer = setTimeout(() => setShowBadge(true), 500);
      const rewardsTimer = setTimeout(() => setShowRewards(true), 800);

      return () => {
        clearTimeout(contentTimer);
        clearTimeout(badgeTimer);
        clearTimeout(rewardsTimer);
      };
    } else {
      setShowContent(false);
      setShowBadge(false);
      setShowRewards(false);
    }
  }, [open, fireConfetti]);

  const levelIndicator = getLevelStars(newLevel);
  const levelColorClass = getLevelColor(newLevel);
  const levelBgClass = getLevelBgColor(newLevel);

  const renderLevelIndicator = () => {
    if (levelIndicator.type === 'crown') {
      return <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500 animate-pulse" />;
    }
    if (levelIndicator.type === 'star') {
      return (
        <span className="flex items-center gap-1">
          {Array.from({ length: levelIndicator.count }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-5 w-5 fill-current animate-pulse',
                levelColorClass
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </span>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-0 bg-gradient-to-b from-background via-background to-muted/30 overflow-hidden">
        <div
          className={cn(
            'flex flex-col items-center text-center py-4 transition-all duration-500',
            showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          )}
        >
          {/* Celebration Header */}
          <div className="text-4xl mb-2 animate-bounce">🎉</div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            CHÚC MỪNG!
          </h2>
          <p className="text-muted-foreground mb-6">
            Bạn đã đạt <span className={cn('font-semibold', levelColorClass)}>Level {newLevel}</span>!
          </p>

          {/* Level Badge */}
          <div
            className={cn(
              'rounded-2xl border-2 px-8 py-4 mb-6 transition-all duration-500',
              levelBgClass,
              showBadge ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            )}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              {renderLevelIndicator()}
              <span className={cn('text-xl font-bold', levelColorClass)}>
                LEVEL {newLevel}
              </span>
              {renderLevelIndicator()}
            </div>
            <p className="text-sm text-muted-foreground">"{newLevelName}"</p>
          </div>

          {/* Rewards Section */}
          {rewards.length > 0 && (
            <div
              className={cn(
                'w-full transition-all duration-500',
                showRewards
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              )}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Gift className="h-5 w-5 text-primary" />
                <span className="font-medium">Phần thưởng mở khóa:</span>
              </div>
              <div className="space-y-2 px-4">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                  >
                    {getRewardIcon(reward.type)}
                    <span className="text-sm">
                      {reward.description || reward.value || 'Phần thưởng đặc biệt'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={() => onOpenChange(false)}
            className="mt-6 px-8"
            size="lg"
          >
            Tuyệt vời! 🎊
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
