import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart } from 'lucide-react';
import { useRelatedPosts } from '@/hooks/usePost';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface RelatedPostsWidgetProps {
  categoryId: string;
  currentPostId: string;
  categoryName?: string;
}

export const RelatedPostsWidget: React.FC<RelatedPostsWidgetProps> = ({
  categoryId,
  currentPostId,
  categoryName,
}) => {
  const { data: posts, isLoading } = useRelatedPosts(categoryId, currentPostId);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="font-semibold text-sm mb-4">
        {categoryName ? `Bài viết trong ${categoryName}` : 'Bài viết liên quan'}
      </h3>
      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/community/post/${post.id}`}
            className="block p-3 -mx-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <h4 className="text-sm font-medium line-clamp-2 mb-2">{post.title}</h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {post.like_count}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {post.comment_count}
              </span>
              <span>
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
