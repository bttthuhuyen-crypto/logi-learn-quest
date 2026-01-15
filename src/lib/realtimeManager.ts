/**
 * Centralized Realtime Channel Manager
 * Uses a SINGLE master channel for all database subscriptions
 * to eliminate channel proliferation and ensure consistent cleanup
 * 
 * CRITICAL: This implements a state machine to prevent re-subscribing
 * when the channel is already subscribing or subscribed.
 * 
 * RATE LIMITING: Prevents rapid re-subscription attempts (10s cooldown per table)
 */
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type TableName = 
  | 'posts' 
  | 'user_presence' 
  | 'notifications' 
  | 'messages' 
  | 'comments' 
  | 'post_likes' 
  | 'post_follows'
  | 'profiles'
  | 'membership_requests'
  | 'community_members'
  | 'events';

interface TableSubscription {
  callbacks: Set<(payload: any) => void>;
  keyedCallbacks: Map<string, (payload: any) => void>;
}

// State machine for channel lifecycle
type ChannelStatus = 'idle' | 'subscribing' | 'subscribed';

// SINGLETON: One master channel for the entire application
let masterChannel: RealtimeChannel | null = null;
let channelStatus: ChannelStatus = 'idle';
const tableSubscriptions = new Map<TableName, TableSubscription>();

// RATE LIMITING: Track last subscription attempt per table
const lastSubscribeAttempt = new Map<TableName, number>();
const RATE_LIMIT_MS = 10000; // 10 seconds

// Broadcast payload to all callbacks for a specific table
const broadcastToTable = (table: TableName, payload: any) => {
  const subscription = tableSubscriptions.get(table);
  if (subscription) {
    // Call regular callbacks
    subscription.callbacks.forEach(cb => {
      try {
        cb(payload);
      } catch {
        // Silently handle callback errors to prevent breaking other subscribers
      }
    });
    // Call keyed callbacks
    subscription.keyedCallbacks.forEach(cb => {
      try {
        cb(payload);
      } catch {
        // Silently handle callback errors
      }
    });
  }
};

// Initialize the master channel with all table subscriptions
// IDEMPOTENT: Will only create and subscribe once
const initMasterChannel = () => {
  // Guard: If channel already exists, do nothing
  if (masterChannel !== null) {
    return;
  }
  
  // Guard: If we're already subscribing or subscribed, do nothing
  if (channelStatus !== 'idle') {
    return;
  }
  
  // Mark as subscribing before creating channel
  channelStatus = 'subscribing';
  
  masterChannel = supabase
    .channel('master-realtime-channel', {
      config: {
        // CRITICAL: self: false prevents processing our own broadcasts
        broadcast: { self: false },
      },
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => broadcastToTable('posts', payload))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => broadcastToTable('messages', payload))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => broadcastToTable('notifications', payload))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => broadcastToTable('comments', payload))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'user_presence' }, (payload) => broadcastToTable('user_presence', payload))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => broadcastToTable('profiles', payload))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'membership_requests' }, (payload) => broadcastToTable('membership_requests', payload))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'community_members' }, (payload) => broadcastToTable('community_members', payload))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, (payload) => broadcastToTable('post_likes', payload))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'post_follows' }, (payload) => broadcastToTable('post_follows', payload))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => broadcastToTable('events', payload))
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channelStatus = 'subscribed';
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        // Reset state on error/close so we can retry
        channelStatus = 'idle';
        masterChannel = null;
      }
    });
};

/**
 * Subscribe to a table's realtime updates
 * All subscriptions share the same master channel
 * 
 * RATE LIMITED: Will skip redundant subscription setup if called within 10s
 * 
 * @param table - The table name to subscribe to
 * @param callback - Callback function when changes occur
 * @param key - Optional unique key for deduplication (prevents listener stacking)
 * @returns Cleanup function to unsubscribe
 */
export const subscribeToTable = (
  table: TableName,
  callback: (payload: any) => void,
  key?: string
): (() => void) => {
  const now = Date.now();
  const lastAttempt = lastSubscribeAttempt.get(table) || 0;
  
  // Rate limit check - if subscription exists and was created recently, just add callback
  const isRateLimited = tableSubscriptions.has(table) && (now - lastAttempt) < RATE_LIMIT_MS;
  
  if (!isRateLimited) {
    // Update rate limit timestamp
    lastSubscribeAttempt.set(table, now);
    
    // Ensure master channel is initialized (idempotent)
    initMasterChannel();
  }
  
  // Get or create subscription for this table
  if (!tableSubscriptions.has(table)) {
    tableSubscriptions.set(table, { 
      callbacks: new Set(),
      keyedCallbacks: new Map()
    });
  }
  
  const subscription = tableSubscriptions.get(table)!;
  
  if (key) {
    // Keyed subscription: replace any existing callback with same key
    subscription.keyedCallbacks.set(key, callback);
  } else {
    // Regular subscription: add to Set (auto-dedupes by reference)
    subscription.callbacks.add(callback);
  }
  
  // Return cleanup function
  return () => {
    if (key) {
      subscription.keyedCallbacks.delete(key);
    } else {
      subscription.callbacks.delete(callback);
    }
    
    // If no more callbacks for this table, remove the subscription entry
    if (subscription.callbacks.size === 0 && subscription.keyedCallbacks.size === 0) {
      tableSubscriptions.delete(table);
    }
    
    // If no more subscriptions at all, cleanup the master channel
    if (tableSubscriptions.size === 0 && masterChannel) {
      cleanupAllChannels();
    }
  };
};

/**
 * Force cleanup all channels - call on logout or app unmount
 */
export const cleanupAllChannels = () => {
  if (masterChannel) {
    supabase.removeChannel(masterChannel);
    masterChannel = null;
  }
  channelStatus = 'idle';
  tableSubscriptions.clear();
  lastSubscribeAttempt.clear();
};

/**
 * Get the count of active table subscriptions (for debugging)
 */
export const getActiveSubscriptionCount = (): number => {
  let count = 0;
  tableSubscriptions.forEach(sub => {
    count += sub.callbacks.size + sub.keyedCallbacks.size;
  });
  return count;
};

/**
 * Check if master channel is active
 */
export const isChannelActive = (): boolean => channelStatus === 'subscribed';

/**
 * Get current channel status (for debugging)
 */
export const getChannelStatus = (): ChannelStatus => channelStatus;
