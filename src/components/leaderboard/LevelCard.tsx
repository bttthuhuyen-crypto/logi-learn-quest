import React from 'react';
import { Lock, Unlock, Gift, BookOpen, MessageCircle, Award } from 'lucide-react';
import { getLevelBgColor, getLevelColor } from '@/utils/levelConfig';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LevelReward {
  type: 'course_unlock' | 'chat_access' | 'badge' | 'custom';
  description: string | null;
}

interface LevelCardProps {
  level: number;
  name: string;
  pointsRequired: number;
  rewards?: LevelReward[];
  currentLevel: number;
  isCompact?: boolean;
}

export function LevelCard({ 
  level, 
  name, 
  pointsRequired, 
  rewards = [], 
  currentLevel,
  isCompact = false 
}: LevelCardProps) {
  const { formatNumber } = useLanguage();
  const isUnlocked = currentLevel >= level;
  const isCurrent = currentLevel === level;

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'course_unlock':
        return <BookOpen className="h-3.5 w-3.5" />;
      case 'chat_access':
        return <MessageCircle className="h-3.5 w-3.5" />;
      case 'badge':
        return <Award className="h-3.5 w-3.5" />;
      default:
        return <Gift className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div
      className={`
        relative flex-shrink-0 rounded-xl border-2 p-3 transition-all
        ${isCompact ? 'w-24' : 'w-32'}
        ${isCurrent 
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg' 
          : ''
        }
        ${getLevelBgColor(level)}
        ${!isUnlocked ? 'opacity-60' : ''}
      `}
    >
      {/* Lock/Unlock indicator */}
      <div className={`
        absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center
        ${isUnlocked 
          ? 'bg-green-500 text-white' 
          : 'bg-muted text-muted-foreground'
        }
      `}>
        {isUnlocked ? (
          <Unlock className="h-3 w-3" />
        ) : (
          <Lock className="h-3 w-3" />
        )}
      </div>

      {/* Level number */}
      <div className={`
        text-2xl font-bold mb-1
        ${getLevelColor(level)}
      `}>
        {level}
      </div>

      {/* Level name */}
      <div className="text-xs font-medium truncate mb-1">
        {name}
      </div>

      {/* Points required */}
      <div className="text-[10px] text-muted-foreground mb-2">
        {formatNumber(pointsRequired)} pts
      </div>

      {/* Rewards */}
      {rewards.length > 0 && (
        <TooltipProvider>
          <div className="flex gap-1 flex-wrap">
            {rewards.slice(0, 3).map((reward, idx) => (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <div className={`
                    p-1 rounded-md
                    ${isUnlocked 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {getRewardIcon(reward.type)}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-48">
                  <p className="text-xs">{reward.description || reward.type}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            {rewards.length > 3 && (
              <div className="p-1 rounded-md bg-muted text-muted-foreground text-xs">
                +{rewards.length - 3}
              </div>
            )}
          </div>
        </TooltipProvider>
      )}

      {/* Current level indicator */}
      {isCurrent && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-full whitespace-nowrap">
          Hiện tại
        </div>
      )}
    </div>
  );
}
