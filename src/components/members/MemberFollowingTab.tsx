import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFollowing, useIsFollowing, useToggleFollow, FollowUser } from '@/hooks/useUserFollows';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LevelBadge } from '@/components/community/LevelBadge';
import { UserMinus, ChevronLeft, ChevronRight } from 'lucide-react';

interface MemberFollowingTabProps {
  userId: string;
}

const FollowingCard: React.FC<{ 
  following: FollowUser; 
  currentUserId?: string;
  isViewingOwnProfile: boolean;
}> = ({ 
  following,
  currentUserId,
  isViewingOwnProfile,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: isFollowing } = useIsFollowing(following.user_id);
  const toggleFollow = useToggleFollow();
  
  const isOwnCard = currentUserId === following.user_id;
  const showUnfollow = isViewingOwnProfile && !isOwnCard;

  const handleUnfollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return;
    toggleFollow.mutate({ targetUserId: following.user_id, isFollowing: true });
  };

  return (
    <div
      onClick={() => navigate(`/members/${following.user_id}`)}
      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={following.avatar_url || undefined} />
        <AvatarFallback>{following.full_name?.charAt(0) || '?'}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">
            {following.full_name || t.common.anonymous}
          </span>
          <LevelBadge level={following.level || 1} />
        </div>
        {following.bio && (
          <p className="text-xs text-muted-foreground truncate">{following.bio}</p>
        )}
      </div>

      {showUnfollow && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleUnfollow}
          disabled={toggleFollow.isPending}
          className="shrink-0"
        >
          <UserMinus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export const MemberFollowingTab: React.FC<MemberFollowingTabProps> = ({ userId }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = useFollowing(userId, page);

  const following = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);
  const isViewingOwnProfile = user?.id === userId;

  if (isLoading && following.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (following.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t.memberProfile.noFollowing}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {following.map((follow) => (
          <FollowingCard 
            key={follow.id} 
            following={follow}
            currentUserId={user?.id}
            isViewingOwnProfile={isViewingOwnProfile}
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
