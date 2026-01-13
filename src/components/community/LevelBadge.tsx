import React from 'react';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: number | null;
  size?: 'sm' | 'md';
}

const LEVEL_CONFIG: Record<number, { label: string; className: string }> = {
  0: { label: 'Newbie', className: 'bg-muted text-muted-foreground' },
  1: { label: 'Lv.1', className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  2: { label: 'Lv.2', className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  3: { label: 'Lv.3', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  4: { label: 'Lv.4', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  5: { label: 'Lv.5', className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  6: { label: 'Lv.6', className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  7: { label: 'Lv.7', className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  8: { label: 'Lv.8', className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  9: { label: 'Master', className: 'bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-600 dark:text-amber-400 font-semibold' },
};

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, size = 'sm' }) => {
  const safeLevel = Math.min(Math.max(level ?? 0, 0), 9);
  const config = LEVEL_CONFIG[safeLevel];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
        config.className
      )}
    >
      {config.label}
    </span>
  );
};
