import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, Users, User, Trophy } from 'lucide-react';
import { MemberStats } from '@/hooks/useMemberStats';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface MemberStatsSectionProps {
  stats: MemberStats;
  onTabChange?: (tab: string) => void;
}

export const MemberStatsSection: React.FC<MemberStatsSectionProps> = ({
  stats,
  onTabChange,
}) => {
  const { t } = useLanguage();

  const statItems = [
    {
      key: 'posts',
      icon: FileText,
      label: t.memberProfile.posts,
      value: stats.postsCount,
      clickable: true,
      tab: 'posts',
    },
    {
      key: 'followers',
      icon: Users,
      label: t.memberProfile.followers,
      value: stats.followersCount,
      clickable: true,
      tab: 'followers',
    },
    {
      key: 'following',
      icon: User,
      label: t.memberProfile.followingLabel,
      value: stats.followingCount,
      clickable: true,
      tab: 'following',
    },
    {
      key: 'points',
      icon: Trophy,
      label: t.memberProfile.points,
      value: stats.points,
      clickable: false,
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
      {statItems.map((item) => (
        <Card
          key={item.key}
          className={cn(
            "p-4 text-center transition-colors",
            item.clickable && onTabChange && "cursor-pointer hover:bg-accent/50"
          )}
          onClick={() => item.clickable && onTabChange?.(item.tab!)}
        >
          <item.icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-2xl font-bold">{formatNumber(item.value)}</p>
          <p className="text-xs text-muted-foreground">{item.label}</p>
        </Card>
      ))}
    </div>
  );
};
