
-- =====================================================
-- MEMBERS SYSTEM SCHEMA - MULTI-COMMUNITY SUPPORT
-- =====================================================

-- Phase 1: Extend profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location VARCHAR(100);

-- Phase 2: Create ENUMs
DO $$ BEGIN
  CREATE TYPE community_role AS ENUM ('owner', 'admin', 'moderator', 'member');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE member_status AS ENUM ('active', 'muted', 'banned');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE activity_type AS ENUM (
    'post', 'comment', 'like', 'follow', 
    'join', 'complete_course', 'complete_lesson',
    'level_up', 'earn_badge'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Phase 3: Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  owner_id UUID NOT NULL,
  is_public BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase 4: Create community_members table
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role community_role NOT NULL DEFAULT 'member',
  has_billing_access BOOLEAN DEFAULT false,
  status member_status NOT NULL DEFAULT 'active',
  muted_until TIMESTAMPTZ,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  post_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Phase 5: Create user_follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Phase 6: Extend membership_requests with community_id
ALTER TABLE public.membership_requests
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;

-- Phase 7: Create user_activities table
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  points_earned INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase 8: Create Indexes
CREATE INDEX IF NOT EXISTS idx_community_members_community_active 
  ON public.community_members(community_id, last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_members_community_role 
  ON public.community_members(community_id, role);
CREATE INDEX IF NOT EXISTS idx_community_members_user 
  ON public.community_members(user_id);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower 
  ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following 
  ON public.user_follows(following_id);

CREATE INDEX IF NOT EXISTS idx_user_activities_user 
  ON public.user_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_community 
  ON public.user_activities(community_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_type 
  ON public.user_activities(activity_type);

CREATE INDEX IF NOT EXISTS idx_communities_slug 
  ON public.communities(slug);
CREATE INDEX IF NOT EXISTS idx_communities_owner 
  ON public.communities(owner_id);

-- Phase 9: Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Phase 10: RLS Policies for communities
CREATE POLICY "Anyone can view public communities"
  ON public.communities FOR SELECT
  USING (is_public = true OR owner_id = auth.uid());

CREATE POLICY "Owners can manage their communities"
  ON public.communities FOR ALL
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can update communities"
  ON public.communities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = communities.id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Phase 11: RLS Policies for community_members
CREATE POLICY "Members can view all members in their communities"
  ON public.community_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'owner')
  );

CREATE POLICY "Users can join communities"
  ON public.community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership"
  ON public.community_members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage members"
  ON public.community_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin', 'moderator')
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'owner')
  );

CREATE POLICY "Users can leave communities"
  ON public.community_members FOR DELETE
  USING (auth.uid() = user_id);

-- Phase 12: RLS Policies for user_follows
CREATE POLICY "Anyone authenticated can view follows"
  ON public.user_follows FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can follow others"
  ON public.user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Phase 13: RLS Policies for user_activities
CREATE POLICY "Users can view their own activities"
  ON public.user_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activities in their communities"
  ON public.user_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = user_activities.community_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin', 'moderator')
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'owner')
  );

CREATE POLICY "System can insert activities"
  ON public.user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Phase 14: Database Functions

-- Function to calculate level from points
CREATE OR REPLACE FUNCTION public.calculate_level_from_points(p_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN p_points >= 4500 THEN 10
    WHEN p_points >= 3600 THEN 9
    WHEN p_points >= 2800 THEN 8
    WHEN p_points >= 2100 THEN 7
    WHEN p_points >= 1500 THEN 6
    WHEN p_points >= 1000 THEN 5
    WHEN p_points >= 600 THEN 4
    WHEN p_points >= 300 THEN 3
    WHEN p_points >= 100 THEN 2
    ELSE 1
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Function to update member level
CREATE OR REPLACE FUNCTION public.update_member_level(p_user_id UUID, p_community_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_points INTEGER;
  v_new_level INTEGER;
BEGIN
  SELECT points INTO v_points
  FROM public.community_members
  WHERE user_id = p_user_id AND community_id = p_community_id;
  
  IF v_points IS NULL THEN
    RETURN 1;
  END IF;
  
  v_new_level := public.calculate_level_from_points(v_points);
  
  UPDATE public.community_members
  SET level = v_new_level
  WHERE user_id = p_user_id AND community_id = p_community_id;
  
  RETURN v_new_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get online members count
CREATE OR REPLACE FUNCTION public.get_online_members_count(p_community_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.community_members cm
  JOIN public.user_presence up ON cm.user_id = up.user_id
  WHERE cm.community_id = p_community_id
    AND cm.status = 'active'
    AND up.status = 'online'
    AND up.show_online_status = true
    AND up.last_seen_at > NOW() - INTERVAL '5 minutes';
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to calculate activity stats
CREATE OR REPLACE FUNCTION public.calculate_activity_stats(p_user_id UUID, p_community_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'post_count', COALESCE(SUM(CASE WHEN activity_type = 'post' THEN 1 ELSE 0 END), 0),
    'comment_count', COALESCE(SUM(CASE WHEN activity_type = 'comment' THEN 1 ELSE 0 END), 0),
    'like_count', COALESCE(SUM(CASE WHEN activity_type = 'like' THEN 1 ELSE 0 END), 0),
    'follow_count', COALESCE(SUM(CASE WHEN activity_type = 'follow' THEN 1 ELSE 0 END), 0),
    'total_points', COALESCE(SUM(points_earned), 0),
    'total_activities', COUNT(*)
  ) INTO v_stats
  FROM public.user_activities
  WHERE user_id = p_user_id
    AND (p_community_id IS NULL OR community_id = p_community_id);
  
  RETURN COALESCE(v_stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to log activity and award points
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_community_id UUID,
  p_activity_type activity_type,
  p_target_type VARCHAR DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_points INTEGER;
  v_activity_id UUID;
BEGIN
  v_points := CASE p_activity_type
    WHEN 'post' THEN 10
    WHEN 'comment' THEN 5
    WHEN 'like' THEN 1
    WHEN 'follow' THEN 2
    WHEN 'join' THEN 50
    WHEN 'complete_course' THEN 100
    WHEN 'complete_lesson' THEN 20
    ELSE 0
  END;
  
  INSERT INTO public.user_activities (
    user_id, community_id, activity_type, 
    target_type, target_id, points_earned, metadata
  )
  VALUES (
    p_user_id, p_community_id, p_activity_type,
    p_target_type, p_target_id, v_points, p_metadata
  )
  RETURNING id INTO v_activity_id;
  
  IF p_community_id IS NOT NULL THEN
    UPDATE public.community_members
    SET 
      points = points + v_points,
      last_active_at = NOW()
    WHERE user_id = p_user_id AND community_id = p_community_id;
    
    PERFORM public.update_member_level(p_user_id, p_community_id);
  END IF;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Phase 15: Triggers

-- Trigger to update community member_count
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities
    SET member_count = member_count + 1
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities
    SET member_count = member_count - 1
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trigger_update_community_member_count ON public.community_members;
CREATE TRIGGER trigger_update_community_member_count
  AFTER INSERT OR DELETE ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_community_member_count();

-- Trigger to update updated_at on communities
CREATE OR REPLACE FUNCTION public.update_communities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trigger_update_communities_updated_at ON public.communities;
CREATE TRIGGER trigger_update_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_communities_updated_at();

-- Enable realtime for new tables (skip user_presence as it already exists)
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_follows;
