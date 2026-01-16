import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CommunityCategory {
  id: string;
  name: string;
  emoji: string | null;
  slug: string;
  order_index: number;
  created_at: string;
}

export function useCommunityCategories() {
  return useQuery({
    queryKey: ['community-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as CommunityCategory[];
    },
  });
}
