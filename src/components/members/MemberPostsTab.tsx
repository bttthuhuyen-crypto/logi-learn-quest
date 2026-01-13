import React from 'react';
import { useMemberPosts } from '@/hooks/useMemberPosts';
import { PostCard } from '@/components/community/PostCard';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MemberPostsTabProps {
  userId: string;
}

export const MemberPostsTab: React.FC<MemberPostsTabProps> = ({ userId }) => {
  const { t } = useLanguage();
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = useMemberPosts(userId, page);
  
  const posts = data?.posts || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  if (isLoading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t.memberProfile.noPosts}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <PostCard
          key={post.id}
          post={post}
        />
      ))}

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
