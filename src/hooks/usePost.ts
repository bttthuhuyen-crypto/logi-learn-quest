import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Post, PostMedia, Poll, PollOption } from './usePosts';

export const usePost = (postId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['post', postId],
    queryFn: async (): Promise<Post | null> => {
      if (!postId) return null;

      // 1. Fetch post with category
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          category:categories(id, name, emoji, slug)
        `)
        .eq('id', postId)
        .single();

      if (postError || !post) {
        console.error('Error fetching post:', postError);
        return null;
      }

      // 2. Fetch author profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, level')
        .eq('user_id', post.author_id)
        .single();

      // 3. Fetch media
      const { data: mediaData } = await supabase
        .from('post_media')
        .select('*')
        .eq('post_id', postId)
        .order('order_index');

      const media: PostMedia[] = (mediaData || []).map((m) => ({
        id: m.id,
        media_type: m.media_type as 'image' | 'video' | 'gif' | 'link',
        media_url: m.media_url,
        thumbnail_url: m.thumbnail_url,
        order_index: m.order_index,
      }));

      // 4. Fetch poll if poll post
      let poll: Poll | undefined;
      if (post.content_type === 'poll') {
        const { data: pollData } = await supabase
          .from('polls')
          .select('*')
          .eq('post_id', postId)
          .single();

        if (pollData) {
          const { data: optionsData } = await supabase
            .from('poll_options')
            .select('*')
            .eq('poll_id', pollData.id)
            .order('order_index');

          const options: PollOption[] = (optionsData || []).map((o) => ({
            id: o.id,
            option_text: o.option_text,
            vote_count: o.vote_count,
            order_index: o.order_index,
          }));

          const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);

          poll = {
            id: pollData.id,
            question: pollData.question,
            ends_at: pollData.ends_at,
            is_multiple_choice: pollData.is_multiple_choice,
            options,
            total_votes: totalVotes,
          };
        }
      }

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        content_type: post.content_type as 'text' | 'poll',
        author_id: post.author_id,
        category_id: post.category_id,
        like_count: post.like_count,
        comment_count: post.comment_count,
        is_pinned: post.is_pinned,
        pinned_at: post.pinned_at,
        is_action_post: post.is_action_post,
        action_completed_count: post.action_completed_count,
        created_at: post.created_at,
        updated_at: post.updated_at,
        last_activity_at: post.last_activity_at,
        category: post.category,
        author: profile || undefined,
        media: media.length > 0 ? media : undefined,
        poll,
      };
    },
    enabled: !!postId,
  });

  // Real-time subscription for post updates
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`post-detail-${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts', filter: `id=eq.${postId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['post', postId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  return query;
};

// Hook to fetch related posts (same category, exclude current)
export const useRelatedPosts = (categoryId: string | undefined, currentPostId: string | undefined) => {
  return useQuery({
    queryKey: ['related-posts', categoryId, currentPostId],
    queryFn: async () => {
      if (!categoryId || !currentPostId) return [];

      const { data } = await supabase
        .from('posts')
        .select('id, title, comment_count, like_count, created_at')
        .eq('category_id', categoryId)
        .neq('id', currentPostId)
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    },
    enabled: !!categoryId && !!currentPostId,
  });
};

// Hook to fetch author's other posts
export const useAuthorPosts = (authorId: string | undefined, currentPostId: string | undefined) => {
  return useQuery({
    queryKey: ['author-posts', authorId, currentPostId],
    queryFn: async () => {
      if (!authorId || !currentPostId) return [];

      const { data } = await supabase
        .from('posts')
        .select('id, title, comment_count, like_count, created_at')
        .eq('author_id', authorId)
        .neq('id', currentPostId)
        .order('created_at', { ascending: false })
        .limit(3);

      return data || [];
    },
    enabled: !!authorId && !!currentPostId,
  });
};
