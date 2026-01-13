import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export type CommentSortOption = 'newest' | 'oldest' | 'top';

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  like_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    level: number | null;
  };
  replies?: Comment[];
  reply_count?: number;
}

interface UseCommentsOptions {
  postId: string;
  sort?: CommentSortOption;
  limit?: number;
}

export const useComments = ({ postId, sort = 'newest', limit = 20 }: UseCommentsOptions) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['comments', postId, sort],
    queryFn: async () => {
      // First fetch top-level comments
      let commentsQuery = supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .is('parent_id', null);

      // Apply sorting
      switch (sort) {
        case 'oldest':
          commentsQuery = commentsQuery.order('created_at', { ascending: true });
          break;
        case 'top':
          commentsQuery = commentsQuery.order('like_count', { ascending: false });
          break;
        default: // newest
          commentsQuery = commentsQuery.order('created_at', { ascending: false });
      }

      commentsQuery = commentsQuery.limit(limit);

      const { data: topLevelComments, error: commentsError } = await commentsQuery;
      if (commentsError) throw commentsError;

      if (!topLevelComments || topLevelComments.length === 0) {
        return [];
      }

      // Fetch all replies for these comments
      const commentIds = topLevelComments.map(c => c.id);
      const { data: replies, error: repliesError } = await supabase
        .from('comments')
        .select('*')
        .in('parent_id', commentIds)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      // Get all unique author IDs
      const allComments = [...topLevelComments, ...(replies || [])];
      const authorIds = [...new Set(allComments.map(c => c.author_id))];

      // Fetch author profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, level')
        .in('user_id', authorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Build nested comments structure
      const repliesMap = new Map<string, Comment[]>();
      replies?.forEach(reply => {
        const commentReplies = repliesMap.get(reply.parent_id!) || [];
        commentReplies.push({
          ...reply,
          author: profileMap.get(reply.author_id),
        });
        repliesMap.set(reply.parent_id!, commentReplies);
      });

      // Count all replies (including nested)
      const getReplyCount = (commentId: string): number => {
        const directReplies = repliesMap.get(commentId) || [];
        return directReplies.length;
      };

      return topLevelComments.map(comment => ({
        ...comment,
        author: profileMap.get(comment.author_id),
        replies: repliesMap.get(comment.id) || [],
        reply_count: getReplyCount(comment.id),
      })) as Comment[];
    },
    enabled: !!postId,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  return query;
};

export const useUserCommentLikes = (commentIds: string[]) => {
  return useQuery({
    queryKey: ['comment-likes', commentIds],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', commentIds);

      if (error) throw error;
      return data.map(like => like.comment_id);
    },
    enabled: commentIds.length > 0,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      content, 
      parentId 
    }: { 
      postId: string; 
      content: string; 
      parentId?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: content.trim(),
          parent_id: parentId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      commentId, 
      content,
      postId,
    }: { 
      commentId: string; 
      content: string;
      postId: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('comments')
        .update({ content: content.trim() })
        .eq('id', commentId)
        .eq('author_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      commentId, 
      postId 
    }: { 
      commentId: string; 
      postId: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      commentId, 
      isLiked,
      postId,
    }: { 
      commentId: string; 
      isLiked: boolean;
      postId: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isLiked) {
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['comment-likes'] });
    },
  });
};
