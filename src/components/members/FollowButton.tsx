import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useIsFollowing, useToggleFollow } from '@/hooks/useUserFollows';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { UserPlus, UserMinus, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  size?: 'sm' | 'default' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'outline';
  onFollowChange?: (isFollowing: boolean) => void;
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialFollowing,
  size = 'default',
  showText = true,
  variant = 'default',
  onFollowChange,
  className,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  
  const { data: isFollowingData, isLoading: isCheckingFollow } = useIsFollowing(userId);
  const toggleFollow = useToggleFollow();
  
  // Use prop if provided, otherwise use fetched data
  const isFollowing = initialFollowing !== undefined ? initialFollowing : (isFollowingData ?? false);
  const isLoading = toggleFollow.isPending || isCheckingFollow;
  
  // Don't show button for own profile or if not logged in
  if (!user || user.id === userId) {
    return null;
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    toggleFollow.mutate(
      { targetUserId: userId, isFollowing },
      {
        onSuccess: () => {
          onFollowChange?.(!isFollowing);
        },
      }
    );
  };

  // Determine button state and appearance
  const getButtonConfig = () => {
    if (isLoading) {
      return {
        icon: Loader2,
        text: t.common.loading,
        variant: 'outline' as const,
        className: '',
        iconClassName: 'animate-spin',
      };
    }

    if (isFollowing) {
      if (isHovered) {
        // Hover state when following - show unfollow
        return {
          icon: UserMinus,
          text: t.memberProfile.unfollow,
          variant: 'outline' as const,
          className: 'border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive',
          iconClassName: '',
        };
      }
      // Normal following state
      return {
        icon: Check,
        text: t.memberProfile.followingLabel,
        variant: 'outline' as const,
        className: 'border-primary/50 text-primary',
        iconClassName: '',
      };
    }

    // Not following state
    return {
      icon: UserPlus,
      text: t.memberProfile.follow,
      variant: variant,
      className: '',
      iconClassName: '',
    };
  };

  const config = getButtonConfig();
  const Icon = config.icon;

  const sizeConfig = {
    sm: { button: 'h-8 px-3 text-xs', icon: 'h-3.5 w-3.5' },
    default: { button: 'h-9 px-4 text-sm', icon: 'h-4 w-4' },
    lg: { button: 'h-10 px-5 text-base', icon: 'h-5 w-5' },
  };

  return (
    <Button
      variant={config.variant}
      size={size}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
      className={cn(
        'transition-all duration-200',
        sizeConfig[size].button,
        config.className,
        className
      )}
    >
      <Icon className={cn(sizeConfig[size].icon, showText && 'mr-1.5', config.iconClassName)} />
      {showText && <span>{config.text}</span>}
    </Button>
  );
};
