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
const HEARTBEAT_INTERVAL = 30 * 1000; // 30 seconds
const ACTIVITY_THROTTLE = 30 * 1000; // 30 seconds

export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PresenceStatus>('offline');
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [lastActivity, setLastActivity] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  
  const lastActivityUpdateRef = useRef<number>(0);
  const awayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Update presence in database
  const updatePresenceInDb = useCallback(async (newStatus: PresenceStatus) => {
    if (!user?.id) return;

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
        setStatus(newStatus);
      }
    } catch (error) {
      console.error('Failed to update presence:', error);
    }
  }, [user?.id]);

  // Update status function
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
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
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

  // Activity detection and heartbeat
  useEffect(() => {
    if (!user?.id) return;

    // Set initial online status
    updatePresenceInDb('online');
    setStatus('online');

    const handleActivity = () => {
      const now = Date.now();
      setLastActivity(new Date());

      // Throttle: only update if enough time has passed
      if (now - lastActivityUpdateRef.current > ACTIVITY_THROTTLE) {
        if (status !== 'online') {
          updatePresenceInDb('online');
        }
        lastActivityUpdateRef.current = now;
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

    // Before unload handler
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline status
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

    // Activity events
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Before unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Start heartbeat
    heartbeatRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updatePresenceInDb('online');
      }
    }, HEARTBEAT_INTERVAL);

    // Initial away timeout
    awayTimeoutRef.current = setTimeout(() => {
      updatePresenceInDb('away');
    }, AWAY_TIMEOUT);

    return () => {
      // Cleanup
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      if (awayTimeoutRef.current) {
        clearTimeout(awayTimeoutRef.current);
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }

      // Set offline when unmounting
      updatePresenceInDb('offline');
    };
  }, [user?.id, status, updatePresenceInDb]);

  const value: PresenceContextType = {
    status,
    showOnlineStatus,
    lastActivity,
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
    throw new Error('usePresence must be used within PresenceProvider');
  }
  return context;
};

export { PresenceContext };
