import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bell, 
  MoreHorizontal,
  Pin
} from 'lucide-react';
import { Post, useTogglePostLike } from '@/hooks/usePosts';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostCardProps {
  post: Post;
  isLiked?: boolean;
  onOpenPost?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, isLiked = false, onOpenPost }) => {
  const toggleLike = useTogglePostLike();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike.mutate({ postId: post.id, isLiked });
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <article 
      className="bg-card border border-border rounded-lg p-4 hover:border-foreground/20 transition-colors cursor-pointer"
      onClick={() => onOpenPost?.(post.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author?.avatar_url || ''} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {post.author?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {post.author?.full_name || 'Unknown'}
              </span>
              {post.is_pinned && (
                <Pin className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{timeAgo}</span>
              {post.category && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    {post.category.emoji} {post.category.name}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Lưu bài viết</DropdownMenuItem>
            <DropdownMenuItem>Theo dõi bài viết</DropdownMenuItem>
            <DropdownMenuItem>Báo cáo</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="font-semibold text-base mb-2 line-clamp-2">{post.title}</h3>
        {post.content && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {post.content}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'gap-2 text-muted-foreground hover:text-foreground',
            isLiked && 'text-red-500 hover:text-red-600'
          )}
          onClick={handleLike}
          disabled={toggleLike.isPending}
        >
          <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
          <span>{post.like_count}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onOpenPost?.(post.id);
          }}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post.comment_count}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <Share2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground ml-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
};
