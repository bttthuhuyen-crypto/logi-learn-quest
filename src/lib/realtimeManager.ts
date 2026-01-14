/**
 * Centralized Realtime Channel Manager
 * Uses a SINGLE master channel for all database subscriptions
 * to eliminate channel proliferation and ensure consistent cleanup
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
  | 'community_members';

interface TableSubscription {
  callbacks: Set<(payload: any) => void>;
}

// SINGLETON: One master channel for the entire application
let masterChannel: RealtimeChannel | null = null;
let isSubscribed = false;
const tableSubscriptions = new Map<TableName, TableSubscription>();

// Broadcast payload to all callbacks for a specific table
const broadcastToTable = (table: TableName, payload: any) => {
  const subscription = tableSubscriptions.get(table);
  if (subscription) {
    subscription.callbacks.forEach(cb => {
      try {
        cb(payload);
      } catch (error) {
        // Silently handle callback errors to prevent breaking other subscribers
      }
    });
  }
};

// Initialize the master channel with all table subscriptions
const initMasterChannel = () => {
  if (masterChannel && isSubscribed) return;
  
  masterChannel = supabase
    .channel('master-realtime-channel', {
      config: {
        broadcast: { self: true },
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
    .subscribe((status) => {
      isSubscribed = status === 'SUBSCRIBED';
    });
};

/**
 * Subscribe to a table's realtime updates
 * All subscriptions share the same master channel
 * 
 * @param table - The table name to subscribe to
 * @param callback - Callback function when changes occur
 * @returns Cleanup function to unsubscribe
 */
export const subscribeToTable = (
  table: TableName,
  callback: (payload: any) => void
): (() => void) => {
  // Ensure master channel is initialized
  initMasterChannel();
  
  // Get or create subscription for this table
  if (!tableSubscriptions.has(table)) {
    tableSubscriptions.set(table, { callbacks: new Set() });
  }
  
  const subscription = tableSubscriptions.get(table)!;
  subscription.callbacks.add(callback);
  
  // Return cleanup function
  return () => {
    subscription.callbacks.delete(callback);
    
    // If no more callbacks for this table, remove the subscription entry
    if (subscription.callbacks.size === 0) {
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
    isSubscribed = false;
  }
  tableSubscriptions.clear();
};

/**
 * Get the count of active table subscriptions (for debugging)
 */
export const getActiveSubscriptionCount = (): number => {
  let count = 0;
  tableSubscriptions.forEach(sub => {
    count += sub.callbacks.size;
  });
  return count;
};

/**
 * Check if master channel is active
 */
export const isChannelActive = (): boolean => isSubscribed;
