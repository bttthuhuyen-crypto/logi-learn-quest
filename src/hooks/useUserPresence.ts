import { useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToTable } from '@/lib/realtimeManager';

type PresenceStatus = 'online' | 'away' | 'offline';

interface UserPresence {
  user_id: string;
  status: PresenceStatus;
  last_seen_at: string | null;
  show_online_status: boolean;
}

export const useUserPresence = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch current user's presence settings
  const { data: myPresence } = useQuery({
    queryKey: ['my-presence', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_presence')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserPresence | null;
    },
    enabled: !!user?.id,
  });

  // Update presence status
  const updatePresence = useMutation({
    mutationFn: async (status: PresenceStatus) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-presence'] });
    },
  });

  // Toggle show online status
  const toggleShowOnlineStatus = useMutation({
    mutationFn: async (show: boolean) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          show_online_status: show,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-presence'] });
    },
  });

  // Set up presence tracking with requestIdleCallback for non-blocking updates
  useEffect(() => {
    if (!user?.id) return;

    // Helper to schedule presence update in idle time
    const schedulePresenceUpdate = (status: PresenceStatus) => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          updatePresence.mutate(status);
        }, { timeout: 1000 });
      } else {
        updatePresence.mutate(status);
      }
    };

    // Initialize presence on mount (scheduled in idle time)
    schedulePresenceUpdate('online');

    // Set up visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        schedulePresenceUpdate('online');
      } else {
        schedulePresenceUpdate('away');
      }
    };

    // Set up beforeunload handler
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline status
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_presence?user_id=eq.${user.id}`;
      const body = JSON.stringify({
        status: 'offline',
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Heartbeat to keep online status fresh - exactly 60 seconds as requested
    const heartbeat = setInterval(() => {
      if (document.visibilityState === 'visible') {
        // Use requestIdleCallback to avoid blocking UI thread
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => {
            updatePresence.mutate('online');
          }, { timeout: 1000 });
        } else {
          updatePresence.mutate('online');
        }
      }
    }, 60000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(heartbeat);
      
      // Set offline when unmounting
      updatePresence.mutate('offline');
    };
  }, [user?.id]);

  return {
    myPresence,
    showOnlineStatus: myPresence?.show_online_status ?? true,
    updatePresence,
    toggleShowOnlineStatus,
  };
};

// Hook to get presence status of specific users with realtime updates
export const useUsersPresence = (userIds: string[]) => {
  const queryClient = useQueryClient();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const sortedIds = userIds.slice().sort().join(',');
  
  const { data: presenceData = [], isLoading } = useQuery({
    queryKey: ['users-presence', sortedIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];

      const { data, error } = await supabase
        .from('user_presence')
        .select('user_id, status, last_seen_at, show_online_status')
        .in('user_id', userIds);

      if (error) throw error;
      return data as UserPresence[];
    },
    enabled: userIds.length > 0,
    refetchInterval: 60000, // Exactly 60 seconds
  });

  // Subscribe to shared realtime presence channel
  useEffect(() => {
    if (userIds.length === 0) return;

    // Debounced update handler to batch rapid changes
    const handleUpdate = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ 
          queryKey: ['users-presence', sortedIds] 
        });
      }, 500); // 500ms debounce
    };

    // Use shared realtime manager
    const unsubscribe = subscribeToTable('user_presence', handleUpdate);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      unsubscribe();
    };
  }, [sortedIds, queryClient]);

  const getPresence = useCallback((userId: string): { isOnline: boolean; status: PresenceStatus; lastSeen: string | null } => {
    const presence = presenceData.find(p => p.user_id === userId);
    
    if (!presence || !presence.show_online_status) {
      return { isOnline: false, status: 'offline', lastSeen: null };
    }

    // Consider offline if last seen more than 3 minutes ago
    const lastSeenDate = presence.last_seen_at ? new Date(presence.last_seen_at) : null;
    const isRecent = lastSeenDate && (Date.now() - lastSeenDate.getTime()) < 180000;
    
    return {
      isOnline: presence.status === 'online' && isRecent,
      status: isRecent ? presence.status : 'offline',
      lastSeen: presence.last_seen_at,
    };
  }, [presenceData]);

  return {
    presenceData,
    isLoading,
    getPresence,
  };
};
