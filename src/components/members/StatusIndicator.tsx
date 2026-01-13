import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

type PresenceStatus = 'online' | 'away' | 'offline';

interface StatusIndicatorProps {
  status: PresenceStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  showOffline?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = false,
  className,
  showOffline = false,
}) => {
  const { t } = useLanguage();

  // Don't show anything for offline unless explicitly requested
  if (status === 'offline' && !showOffline) return null;

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400',
  };

  const statusLabels = {
    online: t.presence?.online || 'Online',
    away: t.presence?.away || 'Away',
    offline: t.presence?.offline || 'Offline',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative flex">
        {/* Pulse animation for online status */}
        {status === 'online' && (
          <span
            className={cn(
              'absolute inset-0 rounded-full animate-ping opacity-75',
              statusColors[status],
              sizeClasses[size]
            )}
          />
        )}
        <span
          className={cn(
            'relative rounded-full border-2 border-background',
            sizeClasses[size],
            statusColors[status]
          )}
        />
      </span>
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {statusLabels[status]}
        </span>
      )}
    </span>
  );
};
