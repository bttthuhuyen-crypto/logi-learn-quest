-- Fix PUBLIC_DATA_EXPOSURE: Restrict profile viewing to approved members only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can always view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Approved members can view other profiles
CREATE POLICY "Approved members can view profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM membership_requests
      WHERE user_id = auth.uid() AND status = 'approved'
    ) OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner')
  );