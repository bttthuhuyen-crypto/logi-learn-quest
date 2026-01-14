import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bell, 
  BellOff,
  MoreHorizontal,
  Pin,
  Pencil,
  Trash2,
  Flag,
  Link2,
  CheckSquare
} from 'lucide-react';
import { Post, useTogglePostLike } from '@/hooks/usePosts';
import { useTogglePostFollow } from '@/hooks/usePostFollows';
import { useDeletePost, usePinPost } from '@/hooks/usePostActions';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LevelBadge } from './LevelBadge';
import { PostMediaPreview } from './PostMediaPreview';
import { PostPollPreview } from './PostPollPreview';
import { ReportPostModal } from './ReportPostModal';

interface PostCardProps {
  post: Post;
  isLiked?: boolean;
  isFollowing?: boolean;
  onOpenPost?: (postId: string) => void;
  onCategoryClick?: (categoryId: string) => void;
  onEditPost?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  isLiked = false, 
  isFollowing = false,
  onOpenPost,
  onCategoryClick,
  onEditPost,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const toggleLike = useTogglePostLike();
  const toggleFollow = useTogglePostFollow();
  const deletePost = useDeletePost();
  const pinPost = usePinPost();

  const isAuthor = user?.id === post.author_id;
  const canEdit = isAuthor || isAdmin;

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: vi,
  });

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Vui lòng đăng nhập để thích bài viết');
      return;
    }
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 300);
    toggleLike.mutate({ postId: post.id, isLiked });
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Vui lòng đăng nhập để theo dõi bài viết');
      return;
    }
    toggleFollow.mutate({ postId: post.id, isFollowing });
    toast.success(isFollowing ? 'Đã bỏ theo dõi bài viết' : 'Đang theo dõi bài viết');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/community/post/${post.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Đã sao chép liên kết');
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/community/post/${post.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Đã sao chép liên kết');
  };

  const handleEdit = () => {
    onEditPost?.(post);
  };

  const handleDelete = () => {
    deletePost.mutate(post.id, {
      onSuccess: () => {
        toast.success('Đã xóa bài viết');
        setShowDeleteDialog(false);
      },
      onError: () => {
        toast.error('Không thể xóa bài viết');
      },
    });
  };

  const handlePin = () => {
    pinPost.mutate({ postId: post.id, isPinned: post.is_pinned }, {
      onSuccess: () => {
        toast.success(post.is_pinned ? 'Đã bỏ ghim bài viết' : 'Đã ghim bài viết');
      },
    });
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.author?.user_id) {
      navigate(`/profile/${post.author.user_id}`);
    }
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.category?.id) {
      onCategoryClick?.(post.category.id);
    }
  };

  return (
    <>
      <article 
        className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onOpenPost?.(post.id)}
      >
        {/* Pinned indicator */}
        {post.is_pinned && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 -mt-1">
            <Pin className="h-3 w-3" />
            <span>Đã ghim</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar 
              className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-foreground/20 transition-all"
              onClick={handleAuthorClick}
            >
              <AvatarImage src={post.author?.avatar_url || ''} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {post.author?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span 
                  className="font-medium text-sm hover:underline cursor-pointer"
                  onClick={handleAuthorClick}
                >
                  {post.author?.full_name || 'Unknown'}
                </span>
                <LevelBadge level={post.author?.level ?? 0} />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{timeAgo}</span>
                {post.category && (
                  <>
                    <span>•</span>
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-0 cursor-pointer hover:bg-secondary/80"
                      onClick={handleCategoryClick}
                    >
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
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={handleCopyLink}>
                <Link2 className="h-4 w-4 mr-2" />
                Sao chép liên kết
              </DropdownMenuItem>
              
              {canEdit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                </>
              )}

              {(isAuthor || isAdmin) && (
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa bài viết
                </DropdownMenuItem>
              )}

              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handlePin}>
                    <Pin className="h-4 w-4 mr-2" />
                    {post.is_pinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                  </DropdownMenuItem>
                </>
              )}

              {!isAuthor && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowReportModal(true)}>
                    <Flag className="h-4 w-4 mr-2" />
                    Báo cáo
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="space-y-3 mb-4">
          {/* Action post indicator */}
          {post.is_action_post && (
            <div className="flex items-center gap-2 text-sm">
              <CheckSquare className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">
                {post.action_completed_count} người đã hoàn thành
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold text-base line-clamp-2">{post.title}</h3>
          
          {/* Content preview */}
          {post.content && post.content_type === 'text' && (
            <ContentPreview content={post.content} />
          )}

          {/* Poll */}
          {post.content_type === 'poll' && post.poll && (
            <PostPollPreview poll={post.poll} postId={post.id} />
          )}

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <PostMediaPreview 
              media={post.media} 
              onClick={() => onOpenPost?.(post.id)} 
            />
          )}
        </div>

        {/* Footer */}
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
            <Heart 
              className={cn(
                'h-4 w-4 transition-transform',
                isLiked && 'fill-current',
                isLikeAnimating && 'scale-125'
              )} 
            />
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
            className={cn(
              'gap-2 text-muted-foreground hover:text-foreground',
              isFollowing && 'text-foreground'
            )}
            onClick={handleFollow}
            disabled={toggleFollow.isPending}
          >
            {isFollowing ? (
              <BellOff className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground ml-auto"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </article>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bài viết sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report modal */}
      <ReportPostModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        postId={post.id}
        postTitle={post.title}
      />
    </>
  );
};

// Content preview with "Xem thêm" functionality
const ContentPreview: React.FC<{ content: string }> = ({ content }) => {
  const [expanded, setExpanded] = useState(false);

  // Strip HTML tags to get plain text for length calculation
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const plainText = stripHtml(content);
  const MAX_LENGTH = 200;
  const shouldTruncate = plainText.length > MAX_LENGTH;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // Truncate HTML content safely
  const getTruncatedContent = () => {
    if (!shouldTruncate || expanded) return sanitizeHtml(content);
    
    // Create truncated plain text
    const truncated = plainText.slice(0, MAX_LENGTH);
    return sanitizeHtml(`<p>${truncated}...</p>`);
  };

  return (
    <div>
      <div 
        className="text-sm text-muted-foreground prose prose-sm max-w-none prose-p:my-1 prose-p:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: getTruncatedContent() }}
      />
      {shouldTruncate && (
        <button 
          onClick={handleToggle}
          className="text-sm font-medium text-foreground hover:underline mt-1"
        >
          {expanded ? 'Thu gọn' : 'Xem thêm'}
        </button>
      )}
    </div>
  );
};