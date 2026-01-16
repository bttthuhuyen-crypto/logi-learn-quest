-- Fix infinite recursion in RLS policies for community_members table
-- The existing policies use subqueries that reference community_members itself,
-- causing PostgreSQL to apply RLS recursively and create an infinite loop.

-- 1. Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage members" ON community_members;
DROP POLICY IF EXISTS "Members can view all members in their communities" ON community_members;

-- 2. Recreate SELECT policy using SECURITY DEFINER functions (which bypass RLS)
CREATE POLICY "Members can view all members in their communities" ON community_members
FOR SELECT USING (
  is_community_member(auth.uid(), community_id)
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'owner')
);

-- 3. Recreate management policy for community admins using SECURITY DEFINER functions
CREATE POLICY "Community admins can manage members" ON community_members
FOR ALL USING (
  is_community_admin(auth.uid(), community_id)
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'owner')
);