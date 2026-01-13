import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFollowers, useIsFollowing, useToggleFollow, FollowUser } from '@/hooks/useUserFollows';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LevelBadge } from '@/components/community/LevelBadge';
import { UserPlus, UserMinus, ChevronLeft, ChevronRight } from 'lucide-react';

interface MemberFollowersTabProps {
  userId: string;
}

const FollowerCard: React.FC<{ follower: FollowUser; currentUserId?: string }> = ({ 
  follower,
  currentUserId,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: isFollowing } = useIsFollowing(follower.user_id);
  const toggleFollow = useToggleFollow();
  
  const isOwnProfile = currentUserId === follower.user_id;

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return;
    toggleFollow.mutate({ targetUserId: follower.user_id, isFollowing: isFollowing || false });
  };

  return (
    <div
      onClick={() => navigate(`/members/${follower.user_id}`)}
      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={follower.avatar_url || undefined} />
        <AvatarFallback>{follower.full_name?.charAt(0) || '?'}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">
            {follower.full_name || t.common.anonymous}
          </span>
          <LevelBadge level={follower.level || 1} />
        </div>
        {follower.bio && (
          <p className="text-xs text-muted-foreground truncate">{follower.bio}</p>
        )}
      </div>

      {!isOwnProfile && currentUserId && (
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          onClick={handleFollow}
          disabled={toggleFollow.isPending}
          className="shrink-0"
        >
          {isFollowing ? (
            <UserMinus className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};

export const MemberFollowersTab: React.FC<MemberFollowersTabProps> = ({ userId }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = useFollowers(userId, page);

  const followers = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  if (isLoading && followers.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (followers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t.memberProfile.noFollowers}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {followers.map((follower) => (
          <FollowerCard 
            key={follower.id} 
            follower={follower}
            currentUserId={user?.id}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
