import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchPost {
  id: string;
  title: string;
  author: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  category: {
    name: string;
    emoji: string | null;
  } | null;
}

export const useSearchPosts = (searchQuery: string, limit = 10) => {
  const debouncedQuery = useDebounce(searchQuery, 300);

  return useQuery({
    queryKey: ['search-posts', debouncedQuery, limit],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          id,
          title,
          author_id,
          category:categories(name, emoji)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (debouncedQuery.trim()) {
        query = query.ilike('title', `%${debouncedQuery}%`);
      }

      const { data: posts, error } = await query;
      if (error) throw error;

      if (!posts || posts.length === 0) return [];

      // Fetch author profiles separately
      const authorIds = [...new Set(posts.map(p => p.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', authorIds);

      const profileMap = new Map(
        profiles?.map(p => [p.user_id, p]) || []
      );

      return posts.map(post => ({
        id: post.id,
        title: post.title,
        author: profileMap.get(post.author_id) || null,
        category: post.category,
      })) as SearchPost[];
    },
  });
};
