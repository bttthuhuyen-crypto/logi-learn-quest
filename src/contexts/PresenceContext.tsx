import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

type PresenceStatus = 'online' | 'away' | 'offline';

interface PresenceContextType {
  status: PresenceStatus;
  showOnlineStatus: boolean;
  lastActivity: Date;
  updateStatus: (status: PresenceStatus) => void;
  toggleVisibility: (show: boolean) => Promise<void>;
  isUpdating: boolean;
}

const PresenceContext = createContext<PresenceContextType | null>(null);

const AWAY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const HEARTBEAT_INTERVAL = 60 * 1000; // 60 seconds (reduced from 5 min for better accuracy)
const ACTIVITY_WINDOW = 5 * 60 * 1000; // 5 minutes - only heartbeat if active within this window

export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Use refs for internal tracking to prevent re-renders
  const statusRef = useRef<PresenceStatus>('offline');
  const lastActivityRef = useRef<number>(Date.now());
  
  // Only expose status via state when it ACTUALLY changes
  const [status, setStatus] = useState<PresenceStatus>('offline');
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const awayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Update presence in database - only update React state if status ACTUALLY changes
  const updatePresenceInDb = useCallback(async (newStatus: PresenceStatus) => {
    if (!user?.id) return;

    // Skip if status hasn't changed (prevents redundant DB calls and re-renders)
    if (newStatus === statusRef.current) return;

    try {
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status: newStatus,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (!error) {
        // Update ref immediately
        statusRef.current = newStatus;
        // Only update React state (trigger re-render) when status actually changed
        setStatus(newStatus);
      }
    } catch {
      // Silently handle errors
    }
  }, [user?.id]);

  // Public update function
  const updateStatus = useCallback((newStatus: PresenceStatus) => {
    updatePresenceInDb(newStatus);
  }, [updatePresenceInDb]);

  // Toggle visibility function
  const toggleVisibility = useCallback(async (show: boolean) => {
    if (!user?.id) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          show_online_status: show,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (!error) {
        setShowOnlineStatus(show);
        queryClient.invalidateQueries({ queryKey: ['my-presence'] });
      }
    } catch {
      // Silently handle errors
    } finally {
      setIsUpdating(false);
    }
  }, [user?.id, queryClient]);

  // Fetch initial presence state
  useEffect(() => {
    if (!user?.id) return;

    const fetchPresence = async () => {
      const { data } = await supabase
        .from('user_presence')
        .select('status, show_online_status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setShowOnlineStatus(data.show_online_status ?? true);
      }
    };

    fetchPresence();
  }, [user?.id]);

  // Activity detection and heartbeat - NO status in dependencies
  useEffect(() => {
    if (!user?.id) return;

    // Set initial online status
    statusRef.current = 'online';
    setStatus('online');
    
    // Initial DB update
    supabase
      .from('user_presence')
      .upsert({
        user_id: user.id,
        status: 'online',
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .then();

    const handleActivity = () => {
      lastActivityRef.current = Date.now();

      // If currently away, go back online
      if (statusRef.current === 'away') {
        updatePresenceInDb('online');
      }

      // Reset away timeout
      if (awayTimeoutRef.current) {
        clearTimeout(awayTimeoutRef.current);
      }
      awayTimeoutRef.current = setTimeout(() => {
        updatePresenceInDb('away');
      }, AWAY_TIMEOUT);
    };

    // Visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleActivity();
      } else {
        updatePresenceInDb('away');
      }
    };

    // Before unload handler - use sendBeacon for reliability
    const handleBeforeUnload = () => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_presence?user_id=eq.${user.id}`;
      const body = JSON.stringify({
        status: 'offline',
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      navigator.sendBeacon(
        url,
        new Blob([body], { type: 'application/json' })
      );
    };

    // Minimal activity events
    const activityEvents = ['mousedown', 'keydown', 'touchstart'];
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Heartbeat: only if active within last 5 minutes AND tab visible
    heartbeatRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;
      
      // Only send heartbeat if user was recently active
      if (document.visibilityState === 'visible' && timeSinceActivity <= ACTIVITY_WINDOW) {
        // Only update if we're not already online (prevents redundant calls)
        if (statusRef.current !== 'online') {
          updatePresenceInDb('online');
        }
      }
    }, HEARTBEAT_INTERVAL);

    // Initial away timeout
    awayTimeoutRef.current = setTimeout(() => {
      updatePresenceInDb('away');
    }, AWAY_TIMEOUT);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      if (awayTimeoutRef.current) clearTimeout(awayTimeoutRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);

      // Set offline on unmount
      updatePresenceInDb('offline');
    };
  }, [user?.id, updatePresenceInDb]); // Removed 'status' from deps!

  const value: PresenceContextType = {
    status,
    showOnlineStatus,
    lastActivity: new Date(lastActivityRef.current),
    updateStatus,
    toggleVisibility,
    isUpdating,
  };

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const context = useContext(PresenceContext);
  
  if (!context) {
    return {
      status: 'offline' as const,
      showOnlineStatus: true,
      lastActivity: new Date(),
      updateStatus: () => {},
      toggleVisibility: async () => {},
      isUpdating: false,
    };
  }
  
  return context;
};

export { PresenceContext };
