import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface JoinedCommunity {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export function useMyJoinedCommunities() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-joined-communities', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('community_members')
        .select(`
          community_id,
          communities:community_id (
            id,
            name,
            slug,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      // Transform the data to flatten the communities object
      return (data || [])
        .map(item => item.communities as unknown as JoinedCommunity)
        .filter(Boolean);
    },
    enabled: !!user?.id,
  });
}
