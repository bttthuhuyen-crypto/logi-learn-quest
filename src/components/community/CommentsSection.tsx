import React, { useState, useMemo } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useComments, useUserCommentLikes, useCreateComment, CommentSortOption } from '@/hooks/useComments';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CommentsSectionProps {
  postId: string;
  commentCount: number;
  className?: string;
}

const SORT_OPTIONS: { value: CommentSortOption; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'top', label: 'Nhiều like nhất' },
];

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  postId,
  commentCount,
  className,
}) => {
  const { user } = useAuth();
  const [sort, setSort] = useState<CommentSortOption>('newest');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(10);

  const { data: comments, isLoading } = useComments({ postId, sort, limit: 50 });
  const createComment = useCreateComment();

  // Get all comment IDs for like status
  const allCommentIds = useMemo(() => {
    if (!comments) return [];
    const ids: string[] = [];
    comments.forEach(c => {
      ids.push(c.id);
      c.replies?.forEach(r => ids.push(r.id));
    });
    return ids;
  }, [comments]);

  const { data: likedCommentIds = [] } = useUserCommentLikes(allCommentIds);

  const displayedComments = comments?.slice(0, displayLimit) || [];
  const hasMore = (comments?.length || 0) > displayLimit;

  const handleSubmitComment = async (content: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    try {
      await createComment.mutateAsync({
        postId,
        content,
        parentId: null,
      });
      toast.success('Đã thêm bình luận');
    } catch (error: any) {
      toast.error(error.message || 'Không thể thêm bình luận');
      throw error;
    }
  };

  const handleSubmitReply = async (content: string, parentId: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    try {
      await createComment.mutateAsync({
        postId,
        content,
        parentId,
      });
      setActiveReplyId(null);
      toast.success('Đã thêm phản hồi');
    } catch (error: any) {
      toast.error(error.message || 'Không thể thêm phản hồi');
      throw error;
    }
  };

  const handleReply = (commentId: string, _authorName: string) => {
    setActiveReplyId(commentId);
  };

  const handleCancelReply = () => {
    setActiveReplyId(null);
  };

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 10);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{commentCount} bình luận</span>
        </div>

        <Select value={sort} onValueChange={(val) => setSort(val as CommentSortOption)}>
          <SelectTrigger className="w-[140px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Comment Input */}
      <CommentInput
        onSubmit={handleSubmitComment}
        placeholder="Viết bình luận..."
      />

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : displayedComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có bình luận nào</p>
            <p className="text-sm">Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          <>
            {displayedComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                isLiked={likedCommentIds.includes(comment.id)}
                onReply={handleReply}
                activeReplyId={activeReplyId}
                onCancelReply={handleCancelReply}
                onSubmitReply={handleSubmitReply}
              />
            ))}

            {hasMore && (
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={handleLoadMore}
              >
                Xem thêm bình luận
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
