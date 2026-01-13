import React from 'react';
import { PostCard } from './PostCard';
import { usePosts, useUserPostLikes, SortOption } from '@/hooks/usePosts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MessageSquare, RefreshCw } from 'lucide-react';

interface PostsListProps {
  categoryId: string | null;
  sort: SortOption;
  onOpenPost?: (postId: string) => void;
}

const PostSkeleton = () => (
  <div className="bg-card border border-border rounded-lg p-4 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="flex gap-4 pt-3 border-t border-border">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

export const PostsList: React.FC<PostsListProps> = ({ categoryId, sort, onOpenPost }) => {
  const { data: posts, isLoading, isError, refetch } = usePosts({
    categoryId,
    sort,
    pinnedOnly: false,
  });

  // Filter out pinned posts (they're shown separately)
  const regularPosts = posts?.filter((post) => !post.is_pinned) || [];
  const postIds = regularPosts.map((post) => post.id);
  
  const { data: likedPostIds = [] } = useUserPostLikes(postIds);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground mb-4">Không thể tải bài viết</p>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </Button>
      </div>
    );
  }

  if (regularPosts.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-2">Chưa có bài viết nào</h3>
        <p className="text-sm text-muted-foreground">
          Hãy là người đầu tiên chia sẻ trong cộng đồng!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {regularPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isLiked={likedPostIds.includes(post.id)}
          onOpenPost={onOpenPost}
        />
      ))}
      
      {/* Load more button */}
      {regularPosts.length >= 20 && (
        <div className="text-center pt-4">
          <Button variant="outline" className="w-full max-w-xs">
            Tải thêm bài viết
          </Button>
        </div>
      )}
    </div>
  );
};
