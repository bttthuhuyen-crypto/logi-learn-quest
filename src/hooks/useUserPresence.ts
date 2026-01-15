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

// Activity tracking constants
const ACTIVE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const THROTTLE_MS = 5000; // 5 second throttle
const HEARTBEAT_INTERVAL_MS = 60000; // 60 seconds

// Simple throttle utility
const createThrottle = <T extends (...args: any[]) => void>(fn: T, ms: number): T => {
  let lastCall = 0;
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
};

export const useUserPresence = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Track last user activity
  const lastActivityRef = useRef<number>(Date.now());
  const throttledMutateRef = useRef<((status: PresenceStatus) => void) | null>(null);
  const idleCallbackRef = useRef<number | null>(null);

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

  // Set up presence tracking with throttling and activity detection
  useEffect(() => {
    if (!user?.id) return;

    // Create throttled mutate function (5000ms throttle)
    throttledMutateRef.current = createThrottle((status: PresenceStatus) => {
      updatePresence.mutate(status);
    }, THROTTLE_MS);

    // Helper to schedule presence update in idle time
    const schedulePresenceUpdate = (status: PresenceStatus) => {
      // Cancel any pending idle callback
      if (idleCallbackRef.current !== null) {
        if ('cancelIdleCallback' in window) {
          (window as any).cancelIdleCallback(idleCallbackRef.current);
        }
        idleCallbackRef.current = null;
      }

      if ('requestIdleCallback' in window) {
        idleCallbackRef.current = (window as any).requestIdleCallback(() => {
          throttledMutateRef.current?.(status);
          idleCallbackRef.current = null;
        }, { timeout: 1000 });
      } else {
        throttledMutateRef.current?.(status);
      }
    };

    // Track user activity
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Initialize presence on mount (scheduled in idle time)
    schedulePresenceUpdate('online');

    // Set up visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateActivity();
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

    // Activity event listeners (passive for performance)
    const activityEvents = ['mousemove', 'keydown', 'touchstart', 'scroll'] as const;
    activityEvents.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Heartbeat: runs every 60s, but ONLY updates if user was active in last 5 minutes
    const heartbeat = setInterval(() => {
      const isVisible = document.visibilityState === 'visible';
      const isRecentlyActive = (Date.now() - lastActivityRef.current) <= ACTIVE_WINDOW_MS;
      
      // Only send heartbeat if visible AND recently active
      if (isVisible && isRecentlyActive) {
        schedulePresenceUpdate('online');
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      // Cleanup activity listeners
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(heartbeat);
      
      // Cancel pending idle callback
      if (idleCallbackRef.current !== null) {
        if ('cancelIdleCallback' in window) {
          (window as any).cancelIdleCallback(idleCallbackRef.current);
        }
        idleCallbackRef.current = null;
      }
      
      // Set offline when unmounting (bypass throttle for immediate effect)
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

  // Subscribe to shared realtime presence channel with keyed subscription
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

    // Use shared realtime manager with a unique key to prevent listener stacking
    const unsubscribe = subscribeToTable('user_presence', handleUpdate, `presence:${sortedIds}`);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
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
