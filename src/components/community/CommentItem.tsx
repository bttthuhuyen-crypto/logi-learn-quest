import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Heart, MessageCircle, MoreHorizontal, Pencil, Trash2, Flag, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Comment, useToggleCommentLike, useDeleteComment, useUpdateComment } from '@/hooks/useComments';
import { LevelBadge } from './LevelBadge';
import { CommentInput } from './CommentInput';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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

interface CommentItemProps {
  comment: Comment;
  postId: string;
  isLiked: boolean;
  isReply?: boolean;
  onReply: (commentId: string, authorName: string) => void;
  activeReplyId: string | null;
  onCancelReply: () => void;
  onSubmitReply: (content: string, parentId: string) => Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  isLiked,
  isReply = false,
  onReply,
  activeReplyId,
  onCancelReply,
  onSubmitReply,
}) => {
  const { user } = useAuth();
  const toggleLike = useToggleCommentLike();
  const deleteComment = useDeleteComment();
  const updateComment = useUpdateComment();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const isOwner = user?.id === comment.author_id;
  const isReplyActive = activeReplyId === comment.id;

  const handleLike = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    toggleLike.mutate({ 
      commentId: comment.id, 
      isLiked, 
      postId 
    });
  };

  const handleDelete = async () => {
    try {
      await deleteComment.mutateAsync({ commentId: comment.id, postId });
      toast.success('Đã xóa bình luận');
    } catch (error) {
      toast.error('Không thể xóa bình luận');
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    
    try {
      await updateComment.mutateAsync({
        commentId: comment.id,
        content: editContent,
        postId,
      });
      setIsEditing(false);
      toast.success('Đã cập nhật bình luận');
    } catch (error) {
      toast.error('Không thể cập nhật bình luận');
    }
  };

  const handleReplyClick = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    onReply(comment.id, comment.author?.full_name || 'User');
  };

  return (
    <div className={cn('group', isReply && 'ml-12 pl-4 border-l-2 border-border')}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.author?.avatar_url || ''} />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            {comment.author?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{comment.author?.full_name || 'User'}</span>
            <LevelBadge level={comment.author?.level ?? 0} />
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: vi })}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-muted-foreground">(đã chỉnh sửa)</span>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[60px]"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={updateComment.isPending || !editContent.trim()}
                >
                  {updateComment.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Lưu'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-1 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 px-2 gap-1 text-muted-foreground',
                  isLiked && 'text-red-500'
                )}
                onClick={handleLike}
                disabled={toggleLike.isPending}
              >
                <Heart className={cn('h-3.5 w-3.5', isLiked && 'fill-current')} />
                {comment.like_count > 0 && (
                  <span className="text-xs">{comment.like_count}</span>
                )}
              </Button>

              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 gap-1 text-muted-foreground"
                  onClick={handleReplyClick}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span className="text-xs">Trả lời</span>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner && (
                    <>
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </>
                  )}
                  {!isOwner && (
                    <DropdownMenuItem>
                      <Flag className="h-4 w-4 mr-2" />
                      Báo cáo
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Reply input */}
      {isReplyActive && (
        <div className="mt-3">
          <CommentInput
            onSubmit={(content) => onSubmitReply(content, comment.id)}
            isReply
            replyToUsername={comment.author?.full_name || undefined}
            onCancel={onCancelReply}
            autoFocus
            placeholder="Viết trả lời..."
          />
        </div>
      )}

      {/* Replies */}
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {!showReplies && comment.replies.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground ml-11"
              onClick={() => setShowReplies(true)}
            >
              Xem {comment.replies.length} phản hồi
            </Button>
          ) : (
            <>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  isLiked={false}
                  isReply
                  onReply={onReply}
                  activeReplyId={activeReplyId}
                  onCancelReply={onCancelReply}
                  onSubmitReply={onSubmitReply}
                />
              ))}
              {comment.replies.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground ml-12"
                  onClick={() => setShowReplies(false)}
                >
                  Ẩn bớt phản hồi
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bình luận?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bình luận sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteComment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Xóa'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
