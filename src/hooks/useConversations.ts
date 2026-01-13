import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface ConversationWithDetails {
  id: string;
  type: string;
  created_at: string;
  updated_at: string;
  otherParticipant: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  lastMessage: {
    content: string | null;
    created_at: string;
    sender_id: string;
    message_type: string;
  } | null;
  unreadCount: number;
}

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading, error } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get blocked users
      const { data: blockedData } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', user.id);
      
      const blockedUserIds = blockedData?.map(b => b.blocked_id) || [];

      // Get all conversations user participates in
      const { data: participations, error: partError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          last_read_at,
          conversations (
            id,
            type,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .is('left_at', null);

      if (partError) throw partError;
      if (!participations || participations.length === 0) return [];

      const conversationIds = participations.map(p => p.conversation_id);

      // Get other participants for each conversation
      const { data: allParticipants, error: allPartError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          user_id,
          profiles (
            user_id,
            full_name,
            avatar_url
          )
        `)
        .in('conversation_id', conversationIds)
        .neq('user_id', user.id)
        .is('left_at', null);

      if (allPartError) throw allPartError;

      // Get last message for each conversation
      const { data: lastMessages, error: msgError } = await supabase
        .from('messages')
        .select('conversation_id, content, created_at, sender_id, message_type')
        .in('conversation_id', conversationIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (msgError) throw msgError;

      // Build conversation details (filter out blocked users)
      const conversationsWithDetails = participations
        .map(p => {
          const conversation = p.conversations as any;
          const otherParticipant = allParticipants?.find(
            ap => ap.conversation_id === p.conversation_id
          );
          const profile = otherParticipant?.profiles as any;
          
          // Skip if other participant is blocked
          if (profile && blockedUserIds.includes(profile.user_id)) {
            return null;
          }
        
          // Get last message for this conversation
          const lastMsg = lastMessages?.find(m => m.conversation_id === p.conversation_id);
          
          // Count unread messages
          const unreadCount = lastMessages?.filter(m => 
            m.conversation_id === p.conversation_id &&
            m.sender_id !== user.id &&
            (!p.last_read_at || new Date(m.created_at) > new Date(p.last_read_at))
          ).length || 0;

          return {
            id: conversation.id,
            type: conversation.type,
            created_at: conversation.created_at,
            updated_at: conversation.updated_at,
            otherParticipant: profile ? {
              user_id: profile.user_id,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
            } : null,
            lastMessage: lastMsg ? {
              content: lastMsg.content,
              created_at: lastMsg.created_at,
              sender_id: lastMsg.sender_id,
              message_type: lastMsg.message_type as string,
            } : null,
            unreadCount,
          } as ConversationWithDetails;
        })
        .filter((c): c is ConversationWithDetails => c !== null);

      // Sort by last message time
      return conversationsWithDetails.sort((a, b) => {
        const aTime = a.lastMessage?.created_at || a.created_at;
        const bTime = b.lastMessage?.created_at || b.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
    },
    enabled: !!user?.id,
  });

  // Real-time subscription for new messages
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('conversations-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Create new conversation with a user
  const createConversation = useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Check if conversation already exists
      const { data: existingParticipations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id)
        .is('left_at', null);

      if (existingParticipations && existingParticipations.length > 0) {
        const conversationIds = existingParticipations.map(p => p.conversation_id);
        
        const { data: otherParticipations } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', otherUserId)
          .in('conversation_id', conversationIds)
          .is('left_at', null);

        if (otherParticipations && otherParticipations.length > 0) {
          // Conversation already exists
          return { id: otherParticipations[0].conversation_id, isNew: false };
        }
      }

      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({ type: 'direct' })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConversation.id, user_id: user.id },
          { conversation_id: newConversation.id, user_id: otherUserId },
        ]);

      if (partError) throw partError;

      return { id: newConversation.id, isNew: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
  });

  // Get total unread count
  const totalUnreadCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return {
    conversations,
    isLoading,
    error,
    createConversation,
    totalUnreadCount,
  };
};
