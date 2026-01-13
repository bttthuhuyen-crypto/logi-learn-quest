import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePendingRequestsCount = () => {
  const queryClient = useQueryClient();

  const { data: pendingCount = 0, isLoading } = useQuery({
    queryKey: ['pending-requests-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('membership_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching pending count:', error);
        return 0;
      }

      return count || 0;
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('pending-requests-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'membership_requests',
        },
        () => {
          // Refetch count when any change happens
          queryClient.invalidateQueries({ queryKey: ['pending-requests-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    pendingCount,
    isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['pending-requests-count'] }),
  };
};
