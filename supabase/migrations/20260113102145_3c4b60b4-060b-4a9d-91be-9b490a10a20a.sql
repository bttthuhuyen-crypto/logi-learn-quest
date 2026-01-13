-- =============================================
-- PHASE 1: NOTIFICATIONS & MESSENGER DATABASE SCHEMA
-- =============================================

-- Part 1: Extend Notifications Table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS actor_id UUID,
ADD COLUMN IF NOT EXISTS target_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS target_id UUID,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_actor ON public.notifications(actor_id);

-- Part 2: Create Enums for Messenger
CREATE TYPE public.message_type AS ENUM ('text', 'image', 'file');
CREATE TYPE public.presence_status AS ENUM ('online', 'away', 'offline');
CREATE TYPE public.report_reason AS ENUM ('spam', 'harassment', 'inappropriate', 'scam', 'impersonation', 'other');
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'resolved');

-- Part 3: Create Notification Settings Table
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Email settings
  email_digest VARCHAR(20) DEFAULT 'weekly' CHECK (email_digest IN ('off', 'daily', 'weekly')),
  email_notifications VARCHAR(20) DEFAULT 'daily' CHECK (email_notifications IN ('off', 'instant', 'daily', 'weekly')),
  email_admin_announcements BOOLEAN DEFAULT true,
  email_event_reminders BOOLEAN DEFAULT true,
  
  -- In-app settings
  notify_likes BOOLEAN DEFAULT true,
  notify_comments BOOLEAN DEFAULT true,
  notify_mentions BOOLEAN DEFAULT true,
  notify_followers BOOLEAN DEFAULT true,
  notify_following_posts BOOLEAN DEFAULT true,
  
  -- Push settings
  push_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification settings"
ON public.notification_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
ON public.notification_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
ON public.notification_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Part 4: Create Conversations Table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) DEFAULT 'direct',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Part 5: Create Conversation Participants Table
CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  last_read_at TIMESTAMPTZ,
  is_muted BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation ON public.conversation_participants(conversation_id);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Part 6: Create Messages Table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT,
  message_type public.message_type DEFAULT 'text',
  attachment_url TEXT,
  attachment_name VARCHAR(255),
  attachment_size INTEGER,
  is_auto_dm BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Part 7: Create Message Reads Table
CREATE TABLE public.message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX idx_message_reads_message ON public.message_reads(message_id);

ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- Part 8: Create Blocked Users Table
CREATE TABLE public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocked_users_blocker ON public.blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON public.blocked_users(blocked_id);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Part 9: Create User Reports Table
CREATE TABLE public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  reported_id UUID NOT NULL,
  reason public.report_reason NOT NULL,
  description TEXT,
  status public.report_status DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_reports_status ON public.user_reports(status);
CREATE INDEX idx_user_reports_reporter ON public.user_reports(reporter_id);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Part 10: Create User Presence Table
CREATE TABLE public.user_presence (
  user_id UUID PRIMARY KEY,
  status public.presence_status DEFAULT 'offline',
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  show_online_status BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Part 11: Create Chat Settings Table
CREATE TABLE public.chat_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unlock_chat_enabled BOOLEAN DEFAULT false,
  unlock_chat_level INTEGER DEFAULT 2 CHECK (unlock_chat_level >= 1 AND unlock_chat_level <= 9),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_settings ENABLE ROW LEVEL SECURITY;

-- Part 12: Create Auto DM Settings Table
CREATE TABLE public.auto_dm_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled BOOLEAN DEFAULT false,
  message_template TEXT DEFAULT 'Chào mừng #NAME# đến với cộng đồng! 🎉 Chúc bạn có những trải nghiệm tuyệt vời.',
  sender_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.auto_dm_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Conversations RLS
CREATE POLICY "Users can view conversations they participate in"
ON public.conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = id AND user_id = auth.uid() AND left_at IS NULL
  )
);

CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their conversations"
ON public.conversations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = id AND user_id = auth.uid() AND left_at IS NULL
  )
);

-- Conversation Participants RLS
CREATE POLICY "Users can view participants of their conversations"
ON public.conversation_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id 
    AND cp.user_id = auth.uid() AND cp.left_at IS NULL
  )
);

CREATE POLICY "Users can insert participants"
ON public.conversation_participants FOR INSERT
WITH CHECK (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.conversation_participants cp
  WHERE cp.conversation_id = conversation_participants.conversation_id AND cp.user_id = auth.uid()
));

CREATE POLICY "Users can update their own participation"
ON public.conversation_participants FOR UPDATE
USING (auth.uid() = user_id);

-- Messages RLS
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid() AND left_at IS NULL
  )
);

CREATE POLICY "Users can send messages to their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid() AND left_at IS NULL
  )
);

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
USING (auth.uid() = sender_id);

-- Message Reads RLS
CREATE POLICY "Users can view read receipts in their conversations"
ON public.message_reads FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE m.id = message_reads.message_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can mark messages as read"
ON public.message_reads FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Blocked Users RLS
CREATE POLICY "Users can view their blocked list"
ON public.blocked_users FOR SELECT
USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
ON public.blocked_users FOR INSERT
WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others"
ON public.blocked_users FOR DELETE
USING (auth.uid() = blocker_id);

-- User Reports RLS
CREATE POLICY "Users can view their own reports"
ON public.user_reports FOR SELECT
USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
ON public.user_reports FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

CREATE POLICY "Users can create reports"
ON public.user_reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can update reports"
ON public.user_reports FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- User Presence RLS
CREATE POLICY "Anyone can view presence of users who allow it"
ON public.user_presence FOR SELECT
USING (show_online_status = true OR auth.uid() = user_id);

CREATE POLICY "Users can upsert their own presence"
ON public.user_presence FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presence"
ON public.user_presence FOR UPDATE
USING (auth.uid() = user_id);

-- Chat Settings RLS
CREATE POLICY "Anyone can view chat settings"
ON public.chat_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage chat settings"
ON public.chat_settings FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- Auto DM Settings RLS
CREATE POLICY "Anyone can view auto DM settings"
ON public.auto_dm_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage auto DM settings"
ON public.auto_dm_settings FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- =============================================
-- HELPER FUNCTION
-- =============================================

-- Function to check if a user is blocked
CREATE OR REPLACE FUNCTION public.is_blocked(blocker_user_id UUID, blocked_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.blocked_users
    WHERE blocker_id = blocker_user_id AND blocked_id = blocked_user_id
  )
$$;

-- =============================================
-- UPDATE TRIGGERS
-- =============================================

-- Trigger for notification_settings updated_at
CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for conversations updated_at
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for messages updated_at
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for user_presence updated_at
CREATE TRIGGER update_user_presence_updated_at
BEFORE UPDATE ON public.user_presence
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for chat_settings updated_at
CREATE TRIGGER update_chat_settings_updated_at
BEFORE UPDATE ON public.chat_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for auto_dm_settings updated_at
CREATE TRIGGER update_auto_dm_settings_updated_at
BEFORE UPDATE ON public.auto_dm_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- REALTIME SUBSCRIPTIONS
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;

-- =============================================
-- INSERT DEFAULT SETTINGS
-- =============================================

INSERT INTO public.chat_settings (unlock_chat_enabled, unlock_chat_level) VALUES (false, 2);
INSERT INTO public.auto_dm_settings (is_enabled) VALUES (false);