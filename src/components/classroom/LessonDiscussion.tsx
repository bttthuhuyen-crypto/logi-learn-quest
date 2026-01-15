import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { usePost } from '@/hooks/usePost';
import { CommentsSection } from '@/components/community/CommentsSection';
import { Skeleton } from '@/components/ui/skeleton';

interface LessonDiscussionProps {
  postId: string | null;
  lessonTitle?: string;
}

export const LessonDiscussion: React.FC<LessonDiscussionProps> = ({ 
  postId, 
  lessonTitle 
}) => {
  const { language } = useLanguage();
  const { data: post, isLoading } = usePost(postId || undefined);

  if (!postId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>{language === 'vi' 
          ? 'Chưa có bài thảo luận cho bài học này' 
          : 'No discussion linked to this lesson'}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>{language === 'vi' 
          ? 'Bài viết thảo luận không tồn tại' 
          : 'Discussion post not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">
          {language === 'vi' ? 'Thảo luận bài học' : 'Lesson Discussion'}
        </h3>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-4">
        <Link 
          to={`/community/post/${postId}`} 
          className="hover:underline font-medium"
        >
          {post.title}
        </Link>
        <p className="text-sm text-muted-foreground mt-1">
          {post.comment_count} {language === 'vi' ? 'bình luận' : 'comments'}
        </p>
      </div>
      
      <CommentsSection 
        postId={postId} 
        commentCount={post.comment_count || 0} 
      />
    </div>
  );
};