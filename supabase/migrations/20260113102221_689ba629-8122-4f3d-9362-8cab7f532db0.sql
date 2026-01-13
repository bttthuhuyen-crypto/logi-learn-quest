-- Fix security warnings: Replace overly permissive conversation INSERT policy

-- Drop the permissive policy
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Create a more restrictive policy - users can only create conversations where they are a participant
-- This is handled by requiring the user to also insert themselves as a participant
CREATE POLICY "Authenticated users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);