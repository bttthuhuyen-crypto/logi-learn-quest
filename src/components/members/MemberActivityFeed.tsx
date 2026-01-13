import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MessageCircle, Heart, UserPlus, Users, BookOpen, GraduationCap } from 'lucide-react';
import { Activity } from '@/hooks/useMemberActivities';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MemberActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const activityIcons: Record<string, React.ElementType> = {
  post: FileText,
  comment: MessageCircle,
  like: Heart,
  follow: UserPlus,
  join: Users,
  complete_course: GraduationCap,
  complete_lesson: BookOpen,
};

const activityColors: Record<string, string> = {
  post: 'bg-blue-500/10 text-blue-600',
  comment: 'bg-green-500/10 text-green-600',
  like: 'bg-red-500/10 text-red-600',
  follow: 'bg-purple-500/10 text-purple-600',
  join: 'bg-amber-500/10 text-amber-600',
  complete_course: 'bg-emerald-500/10 text-emerald-600',
  complete_lesson: 'bg-cyan-500/10 text-cyan-600',
};

export const MemberActivityFeed: React.FC<MemberActivityFeedProps> = ({
  activities,
  isLoading,
  hasMore,
  onLoadMore,
}) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? vi : enUS;

  const getActivityDescription = (activity: Activity): string => {
    const metadata = activity.metadata || {};
    const title = (metadata.title as string) || (metadata.name as string) || '';
    
    switch (activity.activity_type) {
      case 'post':
        return t.memberProfile.activityPost.replace('{title}', title || '...');
      case 'comment':
        return t.memberProfile.activityComment.replace('{title}', title || '...');
      case 'like':
        return t.memberProfile.activityLike.replace('{title}', title || '...');
      case 'follow':
        return t.memberProfile.activityFollow.replace('{name}', title || '...');
      case 'join':
        return t.memberProfile.activityJoin;
      case 'complete_course':
        return t.memberProfile.activityCourse.replace('{title}', title || '...');
      case 'complete_lesson':
        return t.memberProfile.activityLesson.replace('{title}', title || '...');
      default:
        return activity.activity_type;
    }
  };

  const handleActivityClick = (activity: Activity) => {
    if (!activity.target_id) return;

    switch (activity.target_type) {
      case 'post':
        navigate(`/community/post/${activity.target_id}`);
        break;
      case 'user':
        navigate(`/members/${activity.target_id}`);
        break;
      case 'course':
        navigate(`/classroom/${activity.target_id}`);
        break;
      default:
        break;
    }
  };

  if (isLoading && activities.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t.memberProfile.noActivities}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, idx) => {
        const Icon = activityIcons[activity.activity_type] || FileText;
        const colorClass = activityColors[activity.activity_type] || 'bg-muted text-muted-foreground';
        const isClickable = !!activity.target_id;

        return (
          <div
            key={activity.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg transition-colors",
              isClickable && "cursor-pointer hover:bg-accent/50"
            )}
            onClick={() => handleActivityClick(activity)}
          >
            {/* Timeline dot */}
            <div className="relative">
              <div className={cn("p-2 rounded-full", colorClass)}>
                <Icon className="h-4 w-4" />
              </div>
              {idx < activities.length - 1 && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-border" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                {getActivityDescription(activity)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(parseISO(activity.created_at), { 
                  addSuffix: true,
                  locale,
                })}
                {activity.points_earned && activity.points_earned > 0 && (
                  <span className="ml-2 text-primary">+{activity.points_earned} points</span>
                )}
              </p>
            </div>
          </div>
        );
      })}

      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full py-3 text-sm text-primary hover:underline disabled:opacity-50"
        >
          {isLoading ? t.common.loading : t.memberProfile.loadMore}
        </button>
      )}
    </div>
  );
};
