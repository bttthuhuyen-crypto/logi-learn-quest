-- Fix overly permissive INSERT policies for system-controlled tables
-- These tables are only written to by SECURITY DEFINER functions, not directly by users

-- Drop old permissive policies
DROP POLICY IF EXISTS "System can insert transactions" ON public.point_transactions;
DROP POLICY IF EXISTS "System can insert rewards" ON public.user_rewards;

-- Create restrictive policies - only allow inserts via SECURITY DEFINER functions
-- Since add_point() and check_and_grant_rewards() use SECURITY DEFINER, 
-- no direct user inserts should be allowed

CREATE POLICY "No direct inserts - use add_point function"
ON public.point_transactions FOR INSERT
WITH CHECK (false);

CREATE POLICY "No direct inserts - use check_and_grant_rewards function"
ON public.user_rewards FOR INSERT
WITH CHECK (false);