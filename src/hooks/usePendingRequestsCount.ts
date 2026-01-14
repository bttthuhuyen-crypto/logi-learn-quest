import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subscribeToTable } from '@/lib/realtimeManager';

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
        return 0;
      }

      return count || 0;
    },
  });

  // Subscribe to realtime updates using shared manager
  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests-count'] });
    };

    const unsubscribe = subscribeToTable('membership_requests', handleUpdate);

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return {
    pendingCount,
    isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['pending-requests-count'] }),
  };
};
