import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const PAGE_SIZE = 10;

export const useMemberPosts = (userId: string | undefined, page: number = 1) => {
  return useQuery({
    queryKey: ['member-posts', userId, page],
    queryFn: async () => {
      if (!userId) return { posts: [], total: 0 };

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Get total count
      const { count } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', userId);

      // Fetch posts with related data
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          category:categories(id, name, emoji, slug),
          author:profiles!posts_author_id_fkey(user_id, full_name, avatar_url, level),
          media:post_media(id, media_url, media_type, order_index),
          poll:polls(
            id,
            question,
            is_multiple_choice,
            ends_at,
            options:poll_options(id, option_text, vote_count, order_index)
          )
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching member posts:', error);
        return { posts: [], total: 0 };
      }

      return { posts: data || [], total: count || 0 };
    },
    enabled: !!userId,
  });
};
