-- Tạo function is_community_member
CREATE OR REPLACE FUNCTION public.is_community_member(_user_id uuid, _community_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM community_members
    WHERE user_id = _user_id 
      AND community_id = _community_id 
      AND status = 'active'
  )
$$;

-- Tạo function is_community_admin
CREATE OR REPLACE FUNCTION public.is_community_admin(_user_id uuid, _community_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM community_members
    WHERE user_id = _user_id 
      AND community_id = _community_id 
      AND role IN ('owner', 'admin', 'moderator')
  )
$$;

-- Drop và tạo lại policies UPDATE/DELETE
DROP POLICY IF EXISTS "Community admins or self can update" ON community_members;
CREATE POLICY "Community admins or self can update" ON community_members
FOR UPDATE USING (
  auth.uid() = user_id 
  OR is_community_admin(auth.uid(), community_id)
  OR has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'owner')
);

DROP POLICY IF EXISTS "Community admins or self can delete" ON community_members;
CREATE POLICY "Community admins or self can delete" ON community_members
FOR DELETE USING (
  auth.uid() = user_id 
  OR is_community_admin(auth.uid(), community_id)
  OR has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'owner')
);

-- Thêm policy cho communities table - chỉ admin platform mới được tạo
DROP POLICY IF EXISTS "Only platform admins can create communities" ON communities;
CREATE POLICY "Only platform admins can create communities" ON communities
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner')
);