-- =====================================================
-- LEADERBOARD/GAMIFICATION SCHEMA
-- =====================================================

-- 1. Create Enum Types
CREATE TYPE public.point_source_type AS ENUM (
  'post_like',
  'comment_like',
  'reply_like',
  'bonus',
  'admin_grant'
);

CREATE TYPE public.reward_type AS ENUM (
  'course_unlock',
  'chat_access',
  'badge',
  'custom'
);

-- 2. Extend community_members table
ALTER TABLE public.community_members 
ADD COLUMN IF NOT EXISTS points_7d INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS points_30d INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_level_up_at TIMESTAMPTZ;

-- 3. Create point_transactions table
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 1,
  source_type public.point_source_type NOT NULL,
  source_id UUID,
  granted_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create level_configs table
CREATE TABLE public.level_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL UNIQUE REFERENCES public.communities(id) ON DELETE CASCADE,
  level_names JSONB DEFAULT '{"1": "Newcomer", "2": "Explorer", "3": "Contributor", "4": "Regular", "5": "Enthusiast", "6": "Expert", "7": "Master", "8": "Legend", "9": "Champion"}'::jsonb,
  points_required JSONB DEFAULT '{"1": 0, "2": 5, "3": 20, "4": 50, "5": 100, "6": 200, "7": 400, "8": 700, "9": 1000}'::jsonb,
  enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create level_rewards table
CREATE TABLE public.level_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 9),
  reward_type public.reward_type NOT NULL,
  reward_value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(community_id, level, reward_type)
);

-- 6. Create user_rewards table
CREATE TABLE public.user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  level_reward_id UUID NOT NULL REFERENCES public.level_rewards(id) ON DELETE CASCADE,
  claimed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, level_reward_id)
);

-- 7. Create Indexes
CREATE INDEX idx_point_transactions_user_community 
ON public.point_transactions(user_id, community_id, created_at DESC);

CREATE INDEX idx_community_members_points 
ON public.community_members(community_id, points DESC);

CREATE INDEX idx_community_members_points_7d 
ON public.community_members(community_id, points_7d DESC);

CREATE INDEX idx_community_members_points_30d 
ON public.community_members(community_id, points_30d DESC);

CREATE INDEX idx_level_rewards_community_level 
ON public.level_rewards(community_id, level);

CREATE INDEX idx_user_rewards_user 
ON public.user_rewards(user_id, community_id);

-- 8. Create Functions

-- 8.1 check_and_grant_rewards
CREATE OR REPLACE FUNCTION public.check_and_grant_rewards(
  p_user_id UUID,
  p_community_id UUID,
  p_new_level INTEGER
)
RETURNS SETOF public.user_rewards
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO user_rewards (user_id, community_id, level_reward_id)
  SELECT p_user_id, p_community_id, lr.id
  FROM level_rewards lr
  WHERE lr.community_id = p_community_id
    AND lr.level <= p_new_level
    AND NOT EXISTS (
      SELECT 1 FROM user_rewards ur
      WHERE ur.user_id = p_user_id AND ur.level_reward_id = lr.id
    )
  RETURNING *;
END;
$$;

-- 8.2 add_point
CREATE OR REPLACE FUNCTION public.add_point(
  p_user_id UUID,
  p_community_id UUID,
  p_source_type public.point_source_type,
  p_source_id UUID DEFAULT NULL,
  p_granted_by UUID DEFAULT NULL,
  p_points INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_new_points INTEGER;
  v_transaction_id UUID;
BEGIN
  SELECT level, points INTO v_old_level, v_new_points
  FROM community_members
  WHERE user_id = p_user_id AND community_id = p_community_id;

  INSERT INTO point_transactions (user_id, community_id, points, source_type, source_id, granted_by)
  VALUES (p_user_id, p_community_id, p_points, p_source_type, p_source_id, p_granted_by)
  RETURNING id INTO v_transaction_id;

  v_new_points := COALESCE(v_new_points, 0) + p_points;
  
  UPDATE community_members
  SET 
    points = v_new_points,
    last_active_at = NOW()
  WHERE user_id = p_user_id AND community_id = p_community_id;

  v_new_level := calculate_level_from_points(v_new_points);
  
  IF v_new_level > COALESCE(v_old_level, 1) THEN
    UPDATE community_members
    SET 
      level = v_new_level,
      last_level_up_at = NOW()
    WHERE user_id = p_user_id AND community_id = p_community_id;

    PERFORM check_and_grant_rewards(p_user_id, p_community_id, v_new_level);
  END IF;

  RETURN jsonb_build_object(
    'transaction_id', v_transaction_id,
    'new_points', v_new_points,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'leveled_up', v_new_level > COALESCE(v_old_level, 1)
  );
END;
$$;

-- 8.3 calculate_periodic_points
CREATE OR REPLACE FUNCTION public.calculate_periodic_points(p_community_id UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_updated_count INTEGER := 0;
BEGIN
  UPDATE community_members cm
  SET 
    points_7d = COALESCE((
      SELECT SUM(pt.points)
      FROM point_transactions pt
      WHERE pt.user_id = cm.user_id 
        AND pt.community_id = cm.community_id
        AND pt.created_at >= NOW() - INTERVAL '7 days'
    ), 0),
    points_30d = COALESCE((
      SELECT SUM(pt.points)
      FROM point_transactions pt
      WHERE pt.user_id = cm.user_id 
        AND pt.community_id = cm.community_id
        AND pt.created_at >= NOW() - INTERVAL '30 days'
    ), 0)
  WHERE (p_community_id IS NULL OR cm.community_id = p_community_id);

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$;

-- 8.4 get_user_rank
CREATE OR REPLACE FUNCTION public.get_user_rank(
  p_user_id UUID,
  p_community_id UUID,
  p_period TEXT DEFAULT 'all'
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_rank INTEGER;
BEGIN
  IF p_period = '7d' THEN
    SELECT rank INTO v_rank
    FROM (
      SELECT user_id, RANK() OVER (ORDER BY points_7d DESC) as rank
      FROM community_members
      WHERE community_id = p_community_id AND status = 'active'
    ) ranked
    WHERE user_id = p_user_id;
  ELSIF p_period = '30d' THEN
    SELECT rank INTO v_rank
    FROM (
      SELECT user_id, RANK() OVER (ORDER BY points_30d DESC) as rank
      FROM community_members
      WHERE community_id = p_community_id AND status = 'active'
    ) ranked
    WHERE user_id = p_user_id;
  ELSE
    SELECT rank INTO v_rank
    FROM (
      SELECT user_id, RANK() OVER (ORDER BY points DESC) as rank
      FROM community_members
      WHERE community_id = p_community_id AND status = 'active'
    ) ranked
    WHERE user_id = p_user_id;
  END IF;

  RETURN COALESCE(v_rank, 0);
END;
$$;

-- 9. Create Triggers

-- 9.1 Trigger for post likes
CREATE OR REPLACE FUNCTION public.handle_post_like_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_author_id UUID;
  v_community_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT p.author_id, cm.community_id INTO v_author_id, v_community_id
    FROM posts p
    JOIN community_members cm ON cm.user_id = p.author_id
    WHERE p.id = NEW.post_id
    LIMIT 1;

    IF v_author_id IS NOT NULL AND v_author_id != NEW.user_id AND v_community_id IS NOT NULL THEN
      PERFORM add_point(v_author_id, v_community_id, 'post_like'::point_source_type, NEW.post_id, NEW.user_id, 1);
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_post_like_points
AFTER INSERT ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION handle_post_like_points();

-- 9.2 Trigger for comment likes
CREATE OR REPLACE FUNCTION public.handle_comment_like_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_author_id UUID;
  v_community_id UUID;
  v_is_reply BOOLEAN;
  v_source_type public.point_source_type;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT c.author_id, c.parent_id IS NOT NULL INTO v_author_id, v_is_reply
    FROM comments c
    WHERE c.id = NEW.comment_id;

    SELECT cm.community_id INTO v_community_id
    FROM comments c
    JOIN posts p ON p.id = c.post_id
    JOIN community_members cm ON cm.user_id = c.author_id
    WHERE c.id = NEW.comment_id
    LIMIT 1;

    v_source_type := CASE WHEN v_is_reply THEN 'reply_like'::point_source_type ELSE 'comment_like'::point_source_type END;

    IF v_author_id IS NOT NULL AND v_author_id != NEW.user_id AND v_community_id IS NOT NULL THEN
      PERFORM add_point(v_author_id, v_community_id, v_source_type, NEW.comment_id, NEW.user_id, 1);
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_comment_like_points
AFTER INSERT ON public.comment_likes
FOR EACH ROW
EXECUTE FUNCTION handle_comment_like_points();

-- 10. RLS Policies

-- point_transactions
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.point_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
ON public.point_transactions FOR INSERT
WITH CHECK (true);

-- level_configs
ALTER TABLE public.level_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view level configs"
ON public.level_configs FOR SELECT USING (true);

CREATE POLICY "Admins can manage level configs"
ON public.level_configs FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- level_rewards
ALTER TABLE public.level_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view level rewards"
ON public.level_rewards FOR SELECT USING (true);

CREATE POLICY "Admins can manage level rewards"
ON public.level_rewards FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- user_rewards
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rewards"
ON public.user_rewards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert rewards"
ON public.user_rewards FOR INSERT
WITH CHECK (true);