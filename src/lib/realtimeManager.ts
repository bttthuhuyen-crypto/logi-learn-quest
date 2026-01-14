/**
 * Centralized Realtime Channel Manager
 * Consolidates subscriptions and ensures proper cleanup with reference counting
 */
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type TableName = 'posts' | 'user_presence' | 'notifications' | 'messages' | 'comments' | 'post_likes' | 'post_follows';

interface ChannelSubscription {
  channel: RealtimeChannel;
  refCount: number;
  callbacks: Set<(payload: any) => void>;
}

const channels = new Map<string, ChannelSubscription>();

/**
 * Subscribe to a table with shared channel management
 * Multiple subscribers to the same table will share a single channel
 * 
 * @param table - The table name to subscribe to
 * @param callback - Callback function when changes occur
 * @param filter - Optional filter string (e.g., "user_id=eq.xxx")
 * @returns Cleanup function to unsubscribe
 */
export const subscribeToTable = (
  table: TableName,
  callback: (payload: any) => void,
  filter?: string
): (() => void) => {
  const channelKey = filter ? `${table}-${filter}` : table;
  
  let subscription = channels.get(channelKey);
  
  if (!subscription) {
    const channel = supabase
      .channel(`managed-${channelKey}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table,
          ...(filter ? { filter } : {})
        },
        (payload) => {
          // Broadcast to all registered callbacks
          const sub = channels.get(channelKey);
          sub?.callbacks.forEach(cb => cb(payload));
        }
      )
      .subscribe();
    
    subscription = {
      channel,
      refCount: 0,
      callbacks: new Set(),
    };
    channels.set(channelKey, subscription);
  }
  
  subscription.refCount++;
  subscription.callbacks.add(callback);
  
  // Return cleanup function
  return () => {
    const sub = channels.get(channelKey);
    if (sub) {
      sub.callbacks.delete(callback);
      sub.refCount--;
      
      if (sub.refCount === 0) {
        supabase.removeChannel(sub.channel);
        channels.delete(channelKey);
      }
    }
  };
};

/**
 * Get the count of active channels (for debugging)
 */
export const getActiveChannelCount = (): number => channels.size;

/**
 * Get all active channel keys (for debugging)
 */
export const getActiveChannelKeys = (): string[] => Array.from(channels.keys());
