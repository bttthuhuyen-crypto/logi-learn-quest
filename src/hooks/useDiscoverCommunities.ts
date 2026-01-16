import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DiscoverCommunity {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  logo_url: string | null;
  cover_image_url: string | null;
  member_count: number;
  is_public: boolean;
  category: string | null;
  price: number;
  price_period: string;
  featured: boolean;
  created_at: string;
}

interface UseDiscoverCommunitiesOptions {
  category?: string | null;
  search?: string;
}

export function useDiscoverCommunities(options: UseDiscoverCommunitiesOptions = {}) {
  const { category, search } = options;

  return useQuery({
    queryKey: ['discover-communities', category, search],
    queryFn: async () => {
      let query = supabase
        .from('communities')
        .select('*')
        .eq('is_public', true)
        .order('member_count', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (search && search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DiscoverCommunity[];
    },
  });
}
