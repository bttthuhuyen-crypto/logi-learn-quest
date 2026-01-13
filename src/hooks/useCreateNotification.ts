import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface CreateNotificationPayload {
  user_id: string;
  type: string;
  title: string;
  message: string;
  actor_id?: string;
  target_type?: string;
  target_id?: string;
  data?: Json;
}

export const useCreateNotification = () => {
  const createNotification = useMutation({
    mutationFn: async (payload: CreateNotificationPayload) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: payload.user_id,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          actor_id: payload.actor_id || null,
          target_type: payload.target_type || null,
          target_id: payload.target_id || null,
          data: payload.data || null,
          is_read: false,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Helper function for common notification types
  const notifyMembershipApproved = async (userId: string, actorId: string) => {
    return createNotification.mutateAsync({
      user_id: userId,
      type: 'membership_approved',
      title: 'Yêu cầu tham gia đã được duyệt',
      message: 'Chào mừng! Bạn đã được chấp nhận vào cộng đồng.',
      actor_id: actorId,
    });
  };

  const notifyMembershipDeclined = async (userId: string, actorId: string) => {
    return createNotification.mutateAsync({
      user_id: userId,
      type: 'membership_declined',
      title: 'Yêu cầu tham gia bị từ chối',
      message: 'Rất tiếc, yêu cầu tham gia của bạn đã bị từ chối.',
      actor_id: actorId,
    });
  };

  const notifyNewMessage = async (userId: string, actorId: string, actorName: string, conversationId: string) => {
    return createNotification.mutateAsync({
      user_id: userId,
      type: 'message',
      title: 'Tin nhắn mới',
      message: `${actorName} đã gửi tin nhắn cho bạn`,
      actor_id: actorId,
      target_type: 'conversation',
      target_id: conversationId,
    });
  };

  const notifyLike = async (userId: string, actorId: string, actorName: string, postId: string) => {
    return createNotification.mutateAsync({
      user_id: userId,
      type: 'like',
      title: 'Lượt thích mới',
      message: `${actorName} đã thích bài viết của bạn`,
      actor_id: actorId,
      target_type: 'post',
      target_id: postId,
    });
  };

  const notifyComment = async (userId: string, actorId: string, actorName: string, postId: string) => {
    return createNotification.mutateAsync({
      user_id: userId,
      type: 'comment',
      title: 'Bình luận mới',
      message: `${actorName} đã bình luận bài viết của bạn`,
      actor_id: actorId,
      target_type: 'post',
      target_id: postId,
    });
  };

  const notifyFollow = async (userId: string, actorId: string, actorName: string) => {
    return createNotification.mutateAsync({
      user_id: userId,
      type: 'follow',
      title: 'Người theo dõi mới',
      message: `${actorName} đã bắt đầu theo dõi bạn`,
      actor_id: actorId,
    });
  };

  const notifyAnnouncement = async (userId: string, title: string, message: string) => {
    return createNotification.mutateAsync({
      user_id: userId,
      type: 'announcement',
      title,
      message,
    });
  };

  const notifyNewEvent = async (userId: string, eventId: string, eventTitle: string) => {
    return createNotification.mutateAsync({
      user_id: userId,
      type: 'event_new',
      title: 'Sự kiện mới',
      message: `"${eventTitle}" đã được tạo`,
      target_type: 'event',
      target_id: eventId,
    });
  };

  const notifyEventReminder24h = async (userId: string, eventId: string, eventTitle: string) => {
    return createNotification.mutateAsync({
      user_id: userId,
      type: 'event_reminder_24h',
      title: 'Nhắc nhở sự kiện',
      message: `"${eventTitle}" diễn ra vào ngày mai`,
      target_type: 'event',
      target_id: eventId,
    });
  };

  const notifyEventReminder1h = async (userId: string, eventId: string, eventTitle: string) => {
    return createNotification.mutateAsync({
      user_id: userId,
      type: 'event_reminder_1h',
      title: 'Sắp bắt đầu',
      message: `"${eventTitle}" trong 1 giờ nữa`,
      target_type: 'event',
      target_id: eventId,
    });
  };

  const notifyEventLive = async (userId: string, eventId: string, eventTitle: string) => {
    return createNotification.mutateAsync({
      user_id: userId,
      type: 'event_live',
      title: 'Đang diễn ra',
      message: `"${eventTitle}" đang diễn ra!`,
      target_type: 'event',
      target_id: eventId,
    });
  };

  return {
    createNotification: createNotification.mutate,
    createNotificationAsync: createNotification.mutateAsync,
    isCreating: createNotification.isPending,
    // Helper functions
    notifyMembershipApproved,
    notifyMembershipDeclined,
    notifyNewMessage,
    notifyLike,
    notifyComment,
    notifyFollow,
    notifyAnnouncement,
    notifyNewEvent,
    notifyEventReminder24h,
    notifyEventReminder1h,
    notifyEventLive,
  };
};
