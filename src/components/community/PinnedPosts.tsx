import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostCard } from './PostCard';
import { usePinnedPosts } from '@/hooks/usePosts';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PinnedPostsProps {
  categoryId: string | null;
  likedPostIds: string[];
  onOpenPost?: (postId: string) => void;
}

export const PinnedPosts: React.FC<PinnedPostsProps> = ({ 
  categoryId, 
  likedPostIds,
  onOpenPost 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { data: pinnedPosts, isLoading } = usePinnedPosts(categoryId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (!pinnedPosts || pinnedPosts.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Pin className="h-4 w-4" />
          <span>Đã ghim ({pinnedPosts.length})</span>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 px-2">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="space-y-4">
        {pinnedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isLiked={likedPostIds.includes(post.id)}
            onOpenPost={onOpenPost}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};
