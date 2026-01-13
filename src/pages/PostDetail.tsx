import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
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
  FileQuestion,
  CheckSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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

import { usePost } from '@/hooks/usePost';
import { useUserPostLikes, useTogglePostLike } from '@/hooks/usePosts';
import { useTogglePostFollow, useUserPostFollows } from '@/hooks/usePostFollows';
import { useDeletePost, usePinPost } from '@/hooks/usePostActions';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';

import { LevelBadge } from '@/components/community/LevelBadge';
import { PostMediaGallery } from '@/components/community/PostMediaGallery';
import { PostPollPreview } from '@/components/community/PostPollPreview';
import { CommentsSection } from '@/components/community/CommentsSection';
import { RelatedPostsWidget } from '@/components/community/RelatedPostsWidget';
import { AuthorPostsWidget } from '@/components/community/AuthorPostsWidget';
import { PostEditor, EditPostData } from '@/components/community/PostEditor';

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: post, isLoading, error } = usePost(postId);
  const { data: likedPostIds = [] } = useUserPostLikes(postId ? [postId] : []);
  const { data: followedPostIds = [] } = useUserPostFollows(postId ? [postId] : []);

  const toggleLike = useTogglePostLike();
  const toggleFollow = useTogglePostFollow();
  const deletePost = useDeletePost();
  const pinPost = usePinPost();

  const isLiked = postId ? likedPostIds.includes(postId) : false;
  const isFollowing = postId ? followedPostIds.includes(postId) : false;
  const isAuthor = user?.id === post?.author_id;
  const canEdit = isAuthor || isAdmin;

  const timeAgo = post
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: vi })
    : '';

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/community');
    }
  };

  const handleLike = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thích bài viết');
      return;
    }
    if (!postId) return;
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 300);
    toggleLike.mutate({ postId, isLiked });
  };

  const handleFollow = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để theo dõi bài viết');
      return;
    }
    if (!postId) return;
    toggleFollow.mutate({ postId, isFollowing });
    toast.success(isFollowing ? 'Đã bỏ theo dõi bài viết' : 'Đang theo dõi bài viết');
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Đã sao chép liên kết');
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = () => {
    if (!postId) return;
    deletePost.mutate(postId, {
      onSuccess: () => {
        toast.success('Đã xóa bài viết');
        navigate('/community');
      },
      onError: () => {
        toast.error('Không thể xóa bài viết');
      },
    });
  };

  const handlePin = () => {
    if (!postId || !post) return;
    pinPost.mutate(
      { postId, isPinned: post.is_pinned },
      {
        onSuccess: () => {
          toast.success(post.is_pinned ? 'Đã bỏ ghim bài viết' : 'Đã ghim bài viết');
        },
      }
    );
  };

  const truncate = (text: string | null | undefined, length: number) => {
    if (!text) return '';
    return text.length > length ? text.slice(0, length) + '...' : text;
  };

  // Prepare edit data
  const editPostData: EditPostData | null = post ? {
    id: post.id,
    title: post.title,
    content: post.content,
    category_id: post.category?.id || '',
    is_action_post: post.is_action_post,
    content_type: post.content_type,
    media: post.media?.map(m => ({
      id: m.id,
      media_type: m.media_type,
      media_url: m.media_url,
      thumbnail_url: m.thumbnail_url,
    })) || [],
    poll: post.poll ? {
      id: post.poll.id,
      question: post.poll.question,
      is_multiple_choice: post.poll.is_multiple_choice,
      ends_at: post.poll.ends_at,
    } : null,
  } : null;

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-6 w-64 mb-6" />
          <div className="flex gap-8">
            <div className="flex-1 max-w-[800px] space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="hidden lg:block w-[300px] space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error / Not found state
  if (error || !post) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Không tìm thấy bài viết</h2>
          <p className="text-muted-foreground mb-4">Bài viết có thể đã bị xóa hoặc không tồn tại</p>
          <Button onClick={() => navigate('/community')}>Quay lại Cộng đồng</Button>
        </div>
      </MainLayout>
    );
  }

  const ogImage = post.media?.[0]?.media_url || '/placeholder.svg';

  return (
    <MainLayout>
      <Helmet>
        <title>{post.title} | Cộng đồng</title>
        <meta name="description" content={truncate(post.content, 160)} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={truncate(post.content, 160)} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={truncate(post.content, 160)} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back button */}
        <Button variant="ghost" className="mb-4 -ml-2" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/community">Cộng đồng</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {post.category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/community?category=${post.category.slug}`}>
                      {post.category.emoji} {post.category.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] truncate">
                {post.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex gap-8">
          {/* Main Content */}
          <article className="flex-1 max-w-[800px]">
            <div className="bg-card border border-border rounded-xl p-6">
              {/* Pinned indicator */}
              {post.is_pinned && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                  <Pin className="h-3 w-3" />
                  <span>Đã ghim</span>
                </div>
              )}

              {/* Author Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Avatar
                    className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-foreground/20 transition-all"
                    onClick={() => post.author?.user_id && navigate(`/profile/${post.author.user_id}`)}
                  >
                    <AvatarImage src={post.author?.avatar_url || ''} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                      {post.author?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-semibold hover:underline cursor-pointer"
                        onClick={() => post.author?.user_id && navigate(`/profile/${post.author.user_id}`)}
                      >
                        {post.author?.full_name || 'Unknown'}
                      </span>
                      <LevelBadge level={post.author?.level ?? 0} />
                    </div>
                    <span className="text-sm text-muted-foreground">{timeAgo}</span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleShare}>
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

                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Flag className="h-4 w-4 mr-2" />
                      Báo cáo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Action post indicator */}
              {post.is_action_post && (
                <div className="flex items-center gap-2 text-sm mb-4">
                  <CheckSquare className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">
                    {post.action_completed_count} người đã hoàn thành
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

              {/* Content */}
              {post.content && post.content_type === 'text' && (
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none mb-6 prose-p:my-2 prose-p:leading-relaxed prose-headings:mt-4 prose-headings:mb-2"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              )}

              {/* Poll */}
              {post.content_type === 'poll' && post.poll && (
                <div className="mb-6">
                  <PostPollPreview poll={post.poll} postId={post.id} />
                </div>
              )}

              {/* Media Gallery */}
              {post.media && post.media.length > 0 && (
                <div className="mb-6">
                  <PostMediaGallery media={post.media} />
                </div>
              )}

              {/* Engagement Section */}
              <div className="flex flex-wrap items-center gap-2 py-4 border-t border-border">
                <Button
                  variant={isLiked ? 'default' : 'outline'}
                  size="lg"
                  className={cn('gap-2', isLiked && 'bg-red-500 hover:bg-red-600 border-red-500')}
                  onClick={handleLike}
                  disabled={toggleLike.isPending}
                >
                  <Heart
                    className={cn(
                      'h-5 w-5 transition-transform',
                      isLiked && 'fill-current',
                      isLikeAnimating && 'scale-125'
                    )}
                  />
                  <span>{post.like_count}</span>
                </Button>

                <Button variant="outline" size="lg" className="gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>{post.comment_count}</span>
                </Button>

                <Button
                  variant={isFollowing ? 'default' : 'outline'}
                  size="lg"
                  className="gap-2"
                  onClick={handleFollow}
                  disabled={toggleFollow.isPending}
                >
                  {isFollowing ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                  <span className="hidden sm:inline">
                    {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  </span>
                </Button>

                <Button variant="outline" size="lg" className="gap-2 ml-auto" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                  <span className="hidden sm:inline">Chia sẻ</span>
                </Button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-6">
              <CommentsSection postId={post.id} commentCount={post.comment_count} />
            </div>
          </article>

          {/* Sidebar - Desktop only */}
          <aside className="hidden lg:block w-[300px] flex-shrink-0 space-y-4">
            {post.category && (
              <RelatedPostsWidget
                categoryId={post.category.id}
                currentPostId={post.id}
                categoryName={post.category.name}
              />
            )}
            {post.author && (
              <AuthorPostsWidget
                authorId={post.author.user_id}
                currentPostId={post.id}
                authorName={post.author.full_name || undefined}
              />
            )}
          </aside>
        </div>

        {/* Mobile: Related posts at bottom */}
        <div className="lg:hidden mt-8 space-y-4">
          {post.category && (
            <RelatedPostsWidget
              categoryId={post.category.id}
              currentPostId={post.id}
              categoryName={post.category.name}
            />
          )}
          {post.author && (
            <AuthorPostsWidget
              authorId={post.author.user_id}
              currentPostId={post.id}
              authorName={post.author.full_name || undefined}
            />
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
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

      {/* Edit Post Modal */}
      <PostEditor
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        editPost={editPostData}
      />
    </MainLayout>
  );
};

export default PostDetail;