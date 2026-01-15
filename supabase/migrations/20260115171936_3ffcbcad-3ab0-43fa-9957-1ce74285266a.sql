-- Add 'lesson_completion' to point_source_type enum
ALTER TYPE public.point_source_type ADD VALUE IF NOT EXISTS 'lesson_completion';

-- Create lesson_progress table
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own progress" ON public.lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to award XP for lesson completion
CREATE OR REPLACE FUNCTION public.award_lesson_completion_points(
  p_lesson_id UUID,
  p_points INTEGER DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_community_id UUID;
  v_already_completed BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  -- Check if already completed
  SELECT EXISTS(
    SELECT 1 FROM lesson_progress 
    WHERE user_id = v_user_id AND lesson_id = p_lesson_id
  ) INTO v_already_completed;
  
  IF v_already_completed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already completed');
  END IF;
  
  -- Get community_id from user's membership
  SELECT community_id INTO v_community_id
  FROM community_members
  WHERE user_id = v_user_id
  LIMIT 1;
  
  IF v_community_id IS NULL THEN
    -- Still allow completion but without XP
    INSERT INTO lesson_progress (user_id, lesson_id)
    VALUES (v_user_id, p_lesson_id);
    RETURN jsonb_build_object('success', true, 'points_awarded', 0);
  END IF;
  
  -- Insert progress record
  INSERT INTO lesson_progress (user_id, lesson_id)
  VALUES (v_user_id, p_lesson_id);
  
  -- Award points
  INSERT INTO point_transactions (user_id, community_id, source_type, source_id, points)
  VALUES (v_user_id, v_community_id, 'lesson_completion', p_lesson_id, p_points);
  
  -- Update member points
  UPDATE community_members
  SET 
    points = COALESCE(points, 0) + p_points,
    points_7d = COALESCE(points_7d, 0) + p_points,
    points_30d = COALESCE(points_30d, 0) + p_points
  WHERE user_id = v_user_id AND community_id = v_community_id;
  
  RETURN jsonb_build_object('success', true, 'points_awarded', p_points);
END;
$$;