import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, BookOpen, MessageCircle, Award, Gift, Check } from 'lucide-react';
import { getLevelName, getPointsForLevel, getLevelColor, getLevelBgColor, LevelConfig, DEFAULT_LEVEL_CONFIG } from '@/utils/levelConfig';
import { useLanguage } from '@/i18n/LanguageContext';

interface LevelReward {
  id: string;
  level: number;
  rewardType: 'course_unlock' | 'chat_access' | 'badge' | 'custom';
  rewardValue: string | null;
  description: string | null;
}

interface LevelRewardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLevel: number;
  levelConfig?: LevelConfig | null;
  rewards?: LevelReward[];
}

export function LevelRewardsModal({
  open,
  onOpenChange,
  currentLevel,
  levelConfig,
  rewards = [],
}: LevelRewardsModalProps) {
  const { formatNumber } = useLanguage();
  const config = levelConfig || DEFAULT_LEVEL_CONFIG;

  // Group rewards by level
  const rewardsByLevel = rewards.reduce((acc, reward) => {
    if (!acc[reward.level]) {
      acc[reward.level] = [];
    }
    acc[reward.level].push(reward);
    return acc;
  }, {} as Record<number, LevelReward[]>);

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'course_unlock':
        return <BookOpen className="h-4 w-4" />;
      case 'chat_access':
        return <MessageCircle className="h-4 w-4" />;
      case 'badge':
        return <Award className="h-4 w-4" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };

  const getRewardTypeName = (type: string) => {
    switch (type) {
      case 'course_unlock':
        return 'Mở khóa khóa học';
      case 'chat_access':
        return 'Quyền chat';
      case 'badge':
        return 'Huy hiệu';
      default:
        return 'Phần thưởng';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Chi tiết phần thưởng theo cấp
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((level) => {
              const isUnlocked = currentLevel >= level;
              const isCurrent = currentLevel === level;
              const levelRewards = rewardsByLevel[level] || [];

              return (
                <div
                  key={level}
                  className={`
                    rounded-xl border-2 p-4 transition-all
                    ${getLevelBgColor(level)}
                    ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                    ${!isUnlocked ? 'opacity-60' : ''}
                  `}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${isUnlocked 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        {isUnlocked ? (
                          <Unlock className="h-5 w-5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xl font-bold ${getLevelColor(level)}`}>
                            Level {level}
                          </span>
                          {isCurrent && (
                            <Badge variant="default" className="text-xs">
                              Hiện tại
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getLevelName(level, config)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatNumber(getPointsForLevel(level, config))} pts
                      </p>
                    </div>
                  </div>

                  {/* Rewards */}
                  {levelRewards.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Phần thưởng
                      </p>
                      <div className="space-y-2">
                        {levelRewards.map((reward) => (
                          <div
                            key={reward.id}
                            className={`
                              flex items-center gap-3 p-2 rounded-lg
                              ${isUnlocked 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-muted/50 text-muted-foreground'
                              }
                            `}
                          >
                            {getRewardIcon(reward.rewardType)}
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {getRewardTypeName(reward.rewardType)}
                              </p>
                              {reward.description && (
                                <p className="text-xs opacity-75">
                                  {reward.description}
                                </p>
                              )}
                            </div>
                            {isUnlocked && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Chưa có phần thưởng cho level này
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
