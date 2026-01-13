import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export type SortOption = 'default' | 'new' | 'top_week' | 'top_month';

export interface Post {
  id: string;
  author_id: string;
  category_id: string;
  title: string;
  content: string | null;
  content_type: 'text' | 'poll';
  is_pinned: boolean;
  pinned_at: string | null;
  is_action_post: boolean;
  action_completed_count: number;
  like_count: number;
  comment_count: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  category?: {
    name: string;
    emoji: string | null;
    slug: string;
  };
}

interface UsePostsOptions {
  categoryId?: string | null;
  sort?: SortOption;
  limit?: number;
  pinnedOnly?: boolean;
}

export const usePosts = ({ categoryId, sort = 'default', limit = 20, pinnedOnly = false }: UsePostsOptions = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['posts', categoryId, sort, pinnedOnly],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          category:categories(name, emoji, slug)
        `);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (pinnedOnly) {
        query = query.eq('is_pinned', true);
      }

      // Apply sorting
      switch (sort) {
        case 'new':
          query = query.order('created_at', { ascending: false });
          break;
        case 'top_week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          query = query
            .gte('created_at', weekAgo.toISOString())
            .order('like_count', { ascending: false });
          break;
        case 'top_month':
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          query = query
            .gte('created_at', monthAgo.toISOString())
            .order('like_count', { ascending: false });
          break;
        default:
          // Default: pinned first, then by last_activity_at
          query = query
            .order('is_pinned', { ascending: false })
            .order('last_activity_at', { ascending: false });
      }

      query = query.limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      // Fetch author profiles separately
      const authorIds = [...new Set(data.map((post: any) => post.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', authorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return data.map((post: any) => ({
        ...post,
        author: profileMap.get(post.author_id) || { full_name: null, avatar_url: null },
      })) as Post[];
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const usePinnedPosts = (categoryId?: string | null) => {
  return usePosts({ categoryId, pinnedOnly: true, sort: 'default' });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: {
      title: string;
      content?: string;
      category_id: string;
      content_type?: 'text' | 'poll';
      is_action_post?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...post,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useTogglePostLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useUserPostLikes = (postIds: string[]) => {
  return useQuery({
    queryKey: ['post-likes', postIds],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      if (error) throw error;
      return data.map(like => like.post_id);
    },
    enabled: postIds.length > 0,
  });
};
