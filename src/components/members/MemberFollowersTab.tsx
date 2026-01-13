import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFollowers } from '@/hooks/useUserFollows';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LevelBadge } from '@/components/community/LevelBadge';
import { FollowButton } from '@/components/members/FollowButton';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import type { FollowUser } from '@/hooks/useUserFollows';

interface MemberFollowersTabProps {
  userId: string;
}

const FollowerCard: React.FC<{ follower: FollowUser; currentUserId?: string }> = ({ 
  follower,
  currentUserId,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const isOwnProfile = currentUserId === follower.user_id;

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
        <FollowButton
          userId={follower.user_id}
          size="sm"
          showText={false}
          className="shrink-0"
        />
      )}
    </div>
  );
};

export const MemberFollowersTab: React.FC<MemberFollowersTabProps> = ({ userId }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const { data, isLoading } = useFollowers(userId, page, debouncedSearch);

  const followers = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  if (isLoading && followers.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.follow?.searchPlaceholder || 'Tìm kiếm...'}
            className="pl-9"
            disabled
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.follow?.searchPlaceholder || 'Tìm kiếm...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {followers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? (t.follow?.noResults || 'Không tìm thấy kết quả') : t.memberProfile.noFollowers}
        </div>
      ) : (
        <>
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
          {totalPages > 1 && !searchQuery && (
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
        </>
      )}
    </div>
  );
};
