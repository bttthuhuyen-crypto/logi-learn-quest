import React from 'react';
import { Lock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface ChatLockedOverlayProps {
  requiredLevel: number;
  currentLevel: number;
  variant?: 'full' | 'inline';
}

export const ChatLockedOverlay: React.FC<ChatLockedOverlayProps> = ({
  requiredLevel,
  currentLevel,
  variant = 'full',
}) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleLearnMore = () => {
    navigate('/leaderboard');
  };

  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-center gap-2 py-4 px-4 bg-muted/50 border-t border-border">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {language === 'vi' 
            ? `Cần đạt Level ${requiredLevel} để nhắn tin (Hiện tại: Level ${currentLevel})`
            : `Reach Level ${requiredLevel} to send messages (Current: Level ${currentLevel})`
          }
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-background">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <Lock className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">
        {language === 'vi' ? 'Tính năng chat bị khóa' : 'Chat is locked'}
      </h3>
      
      <p className="text-muted-foreground mb-4 max-w-sm">
        {language === 'vi' 
          ? `Bạn cần đạt Level ${requiredLevel} để mở khóa tính năng nhắn tin`
          : `You need to reach Level ${requiredLevel} to unlock messaging`
        }
      </p>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {language === 'vi' ? 'Level hiện tại' : 'Current Level'}
          </p>
          <p className="text-2xl font-bold text-foreground">{currentLevel}</p>
        </div>
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {language === 'vi' ? 'Level yêu cầu' : 'Required Level'}
          </p>
          <p className="text-2xl font-bold text-primary">{requiredLevel}</p>
        </div>
      </div>
      
      <Button variant="outline" onClick={handleLearnMore}>
        {language === 'vi' ? 'Cách tăng level' : 'How to level up'}
      </Button>
    </div>
  );
};
