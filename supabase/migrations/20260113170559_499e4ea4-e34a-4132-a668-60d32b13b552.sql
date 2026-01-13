-- Fix: Remove anonymous INSERT policy on referral_clicks
-- Force all clicks through the edge function which validates codes and tracks IP/user-agent

DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.referral_clicks;

-- Add admin-only INSERT policy for manual corrections if needed
CREATE POLICY "Admins can insert clicks" ON public.referral_clicks
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner')
  );