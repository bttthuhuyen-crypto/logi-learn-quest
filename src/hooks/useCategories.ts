import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  emoji: string | null;
  slug: string;
  description: string | null;
  post_permission: 'all' | 'admin_only';
  default_sort: 'default' | 'new' | 'top_week' | 'top_month';
  order_index: number;
  post_count: number;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });
};
