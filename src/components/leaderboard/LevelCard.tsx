import React from 'react';
import { Lock, Check, Star, Gift, BookOpen, MessageCircle, Award } from 'lucide-react';
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
  onClick?: () => void;
}

export function LevelCard({ 
  level, 
  name, 
  pointsRequired, 
  rewards = [], 
  currentLevel,
  isCompact = false,
  onClick,
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

  const getRewardShortName = (type: string) => {
    switch (type) {
      case 'course_unlock':
        return 'Khóa học';
      case 'chat_access':
        return 'Chat';
      case 'badge':
        return 'Huy hiệu';
      default:
        return 'Thưởng';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative flex-shrink-0 rounded-xl border-2 p-3 transition-all
        ${isCompact ? 'w-24' : 'w-32'}
        ${isCurrent 
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg scale-105' 
          : ''
        }
        ${getLevelBgColor(level)}
        ${!isUnlocked ? 'opacity-60' : ''}
        ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-md active:scale-100' : ''}
        snap-center
      `}
    >
      {/* State indicator */}
      <div className={`
        absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-sm
        ${isCurrent 
          ? 'bg-primary text-primary-foreground' 
          : isUnlocked 
            ? 'bg-green-500 text-white' 
            : 'bg-muted text-muted-foreground'
        }
      `}>
        {isCurrent ? (
          <Star className="h-3 w-3 fill-current" />
        ) : isUnlocked ? (
          <Check className="h-3 w-3" />
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
          <div className="flex flex-col gap-1">
            {rewards.slice(0, 2).map((reward, idx) => (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <div className={`
                    flex items-center gap-1 p-1 rounded-md text-[10px]
                    ${isUnlocked 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {getRewardIcon(reward.type)}
                    <span className="truncate">{getRewardShortName(reward.type)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-48">
                  <p className="text-xs">{reward.description || reward.type}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            {rewards.length > 2 && (
              <div className="p-1 rounded-md bg-muted text-muted-foreground text-[10px] text-center">
                +{rewards.length - 2} khác
              </div>
            )}
          </div>
        </TooltipProvider>
      )}

      {/* Current level badge */}
      {isCurrent && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-full whitespace-nowrap shadow-sm">
          Hiện tại
        </div>
      )}
    </div>
  );
}
