-- Add new notification columns to notification_settings table
ALTER TABLE public.notification_settings 
  ADD COLUMN IF NOT EXISTS notify_messages boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_level_up boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_affiliate_commission boolean DEFAULT true;