-- Create event_notification_logs table
CREATE TABLE IF NOT EXISTS public.event_notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  total_recipients INTEGER DEFAULT 0,
  successful_sends INTEGER DEFAULT 0,
  failed_sends INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add channel column to event_reminders if not exists
ALTER TABLE public.event_reminders 
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'in_app';

-- Enable RLS on event_notification_logs
ALTER TABLE public.event_notification_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view notification logs
CREATE POLICY "Admins can view notification logs" ON public.event_notification_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- Admins can insert notification logs  
CREATE POLICY "Admins can insert notification logs" ON public.event_notification_logs
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_notification_logs_event_id ON public.event_notification_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_channel ON public.event_reminders(channel);