import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToTable } from '@/lib/realtimeManager';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type SortOption = 'default' | 'new' | 'top_week' | 'top_month' | 'following';

export interface PostMedia {
  id: string;
  media_type: 'image' | 'video' | 'gif' | 'link';
  media_url: string;
  thumbnail_url: string | null;
  order_index: number;
}

export interface PollOption {
  id: string;
  option_text: string;
  vote_count: number;
  order_index: number;
}

export interface Poll {
  id: string;
  question: string;
  is_multiple_choice: boolean;
  ends_at: string | null;
  options: PollOption[];
  total_votes: number;
}

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
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    level: number | null;
  };
  category?: {
    id: string;
    name: string;
    emoji: string | null;
    slug: string;
  };
  media?: PostMedia[];
  poll?: Poll;
}

interface UsePostsOptions {
  categoryId?: string | null;
  sort?: SortOption;
  limit?: number;
  pinnedOnly?: boolean;
  followingOnly?: boolean;
}

// Simple fields that can be updated directly in cache without refetch
const SIMPLE_UPDATE_FIELDS = new Set([
  'like_count', 'comment_count', 'is_pinned', 'pinned_at', 
  'last_activity_at', 'action_completed_count', 'updated_at'
]);

// Complex fields that require full refetch to get related data
const COMPLEX_UPDATE_FIELDS = new Set([
  'title', 'content', 'category_id', 'author_id', 'content_type'
]);

export const usePosts = ({ categoryId, sort = 'default', limit = 20, pinnedOnly = false, followingOnly = false }: UsePostsOptions = {}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const pendingInvalidateRef = useRef<NodeJS.Timeout | null>(null);
  
  // Store queryClient in ref to avoid stale closure
  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient;

  // Memoize filter values for stable closure reference
  const filterRef = useRef({ categoryId, followingOnly });
  filterRef.current = { categoryId, followingOnly };

  const query = useQuery({
    queryKey: ['posts', categoryId, sort, pinnedOnly, followingOnly, user?.id],
    queryFn: async () => {
      // If following filter is active, get following IDs first
      let followingIds: string[] = [];
      if (followingOnly && user?.id) {
        const { data: followingData } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', user.id);
        
        followingIds = followingData?.map(f => f.following_id) || [];
        
        // If user doesn't follow anyone, return empty
        if (followingIds.length === 0) {
          return [];
        }
      }

      let postsQuery = supabase
        .from('posts')
        .select(`
          *,
          category:categories(id, name, emoji, slug)
        `);

      if (categoryId) {
        postsQuery = postsQuery.eq('category_id', categoryId);
      }

      if (pinnedOnly) {
        postsQuery = postsQuery.eq('is_pinned', true);
      }

      // Filter by following users
      if (followingOnly && followingIds.length > 0) {
        postsQuery = postsQuery.in('author_id', followingIds);
      }

      // Apply sorting
      switch (sort) {
        case 'new':
        case 'following':
          postsQuery = postsQuery.order('created_at', { ascending: false });
          break;
        case 'top_week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          postsQuery = postsQuery
            .gte('created_at', weekAgo.toISOString())
            .order('like_count', { ascending: false });
          break;
        case 'top_month':
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          postsQuery = postsQuery
            .gte('created_at', monthAgo.toISOString())
            .order('like_count', { ascending: false });
          break;
        default:
          postsQuery = postsQuery
            .order('is_pinned', { ascending: false })
            .order('last_activity_at', { ascending: false });
      }

      postsQuery = postsQuery.limit(limit);

      const { data, error } = await postsQuery;
      if (error) throw error;

      // Early return for empty data
      if (!data || data.length === 0) return [];

      // Collect IDs for batch fetching
      const authorIds = [...new Set(data.map((post: any) => post.author_id))];
      const postIds = data.map((post: any) => post.id);
      const pollPostIds = data.filter((p: any) => p.content_type === 'poll').map((p: any) => p.id);

      // OPTIMIZED: Parallel fetch profiles, media, and polls
      const [profilesResult, mediaResult, pollsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, level')
          .in('user_id', authorIds),
        supabase
          .from('post_media')
          .select('*')
          .in('post_id', postIds)
          .order('order_index'),
        pollPostIds.length > 0
          ? supabase
              .from('polls')
              .select(`*, options:poll_options(*)`)
              .in('post_id', pollPostIds)
          : Promise.resolve({ data: [] }),
      ]);

      // Build lookup maps
      const profileMap = new Map(profilesResult.data?.map(p => [p.user_id, p]) || []);

      const mediaMap = new Map<string, PostMedia[]>();
      mediaResult.data?.forEach((m: any) => {
        if (!mediaMap.has(m.post_id)) {
          mediaMap.set(m.post_id, []);
        }
        mediaMap.get(m.post_id)!.push(m);
      });

      const pollMap = new Map<string, Poll>();
      pollsResult.data?.forEach((poll: any) => {
        const totalVotes = poll.options?.reduce((sum: number, opt: any) => sum + opt.vote_count, 0) || 0;
        pollMap.set(poll.post_id, {
          ...poll,
          options: poll.options?.sort((a: any, b: any) => a.order_index - b.order_index) || [],
          total_votes: totalVotes,
        });
      });

      return data.map((post: any) => ({
        ...post,
        author: profileMap.get(post.author_id) || { user_id: post.author_id, full_name: null, avatar_url: null, level: null },
        media: mediaMap.get(post.id) || [],
        poll: pollMap.get(post.id),
      })) as Post[];
    },
  });

  // Stable debounced invalidation - uses ref to avoid stale closure
  const debouncedInvalidate = useCallback(() => {
    if (pendingInvalidateRef.current) {
      clearTimeout(pendingInvalidateRef.current);
    }
    pendingInvalidateRef.current = setTimeout(() => {
      queryClientRef.current.invalidateQueries({ queryKey: ['posts'] });
      pendingInvalidateRef.current = null;
    }, 300);
  }, []); // Empty deps - stable reference

  // OPTIMIZED: Use shared realtime manager instead of dedicated channel
  useEffect(() => {
    const handleRealtimeChange = (
      payload: RealtimePostgresChangesPayload<{ [key: string]: any }>
    ) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      const currentFilter = filterRef.current;

      // For DELETE, safely remove from cache
      if (eventType === 'DELETE' && oldRecord?.id) {
        queryClientRef.current.setQueriesData<Post[]>(
          { queryKey: ['posts'] },
          (oldData) => oldData?.filter(post => post.id !== oldRecord.id)
        );
        return;
      }

      // For UPDATE, check if it's a simple update (only counter/flag fields)
      if (eventType === 'UPDATE' && newRecord?.id) {
        const changedKeys = Object.keys(newRecord).filter(key => key !== 'id');
        
        // Check if ANY complex field is present in the payload
        const hasComplexChange = changedKeys.some(key => COMPLEX_UPDATE_FIELDS.has(key));
        
        if (!hasComplexChange) {
          // Simple update - update cache directly without refetch
          queryClientRef.current.setQueriesData<Post[]>(
            { queryKey: ['posts'] },
            (oldData) => oldData?.map(post => 
              post.id === newRecord.id 
                ? { ...post, ...newRecord }
                : post
            )
          );
          return;
        }
        
        // Complex update - need to refetch for related data
        debouncedInvalidate();
        return;
      }

      // For INSERT, check if post matches current filter before invalidating
      if (eventType === 'INSERT' && newRecord) {
        // If category filter is active and post doesn't match, skip
        if (currentFilter.categoryId && newRecord.category_id !== currentFilter.categoryId) {
          return;
        }
        
        // For followingOnly filter, we can't easily check without fetching following list
        // So we debounce invalidate to let the queryFn handle the filter
        debouncedInvalidate();
        return;
      }
    };

    // Use shared realtime manager
    const unsubscribe = subscribeToTable('posts', handleRealtimeChange);

    return () => {
      if (pendingInvalidateRef.current) {
        clearTimeout(pendingInvalidateRef.current);
      }
      unsubscribe();
    };
  }, [debouncedInvalidate]);

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
        .insert({ ...post, author_id: user.id })
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
    // Optimistic update for instant UI feedback
    onMutate: async ({ postId, isLiked }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['post-likes'] });
      
      // Optimistically update like count in all post queries
      queryClient.setQueriesData<Post[]>(
        { queryKey: ['posts'] },
        (oldData) => oldData?.map(post => 
          post.id === postId 
            ? { ...post, like_count: Math.max(0, post.like_count + (isLiked ? -1 : 1)) }
            : post
        )
      );
      
      // Return context for rollback
      return { postId, wasLiked: isLiked };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error - invalidate to get fresh data
      if (context) {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['post-likes'] });
      }
    },
    onSuccess: (_data, { postId }) => {
      // Only invalidate post-likes to update the like status, not full posts
      queryClient.invalidateQueries({ queryKey: ['post-likes'] });
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
