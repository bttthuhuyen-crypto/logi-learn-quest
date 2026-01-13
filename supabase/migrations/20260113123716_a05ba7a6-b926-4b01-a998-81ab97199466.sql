-- =============================================
-- Community Feed Database Schema Migration
-- =============================================

-- 1. Create Enum Types
-- =============================================

CREATE TYPE public.post_permission AS ENUM ('all', 'admin_only');
CREATE TYPE public.category_sort AS ENUM ('default', 'new', 'top_week', 'top_month');
CREATE TYPE public.post_content_type AS ENUM ('text', 'poll');
CREATE TYPE public.media_type AS ENUM ('image', 'video', 'gif', 'link');

-- 2. Create Tables
-- =============================================

-- 2.1 categories - Danh mục bài viết
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  emoji VARCHAR(10),
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  post_permission public.post_permission NOT NULL DEFAULT 'all',
  default_sort public.category_sort NOT NULL DEFAULT 'default',
  order_index INTEGER NOT NULL DEFAULT 0,
  post_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 posts - Bài viết
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  content_type public.post_content_type NOT NULL DEFAULT 'text',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  pinned_at TIMESTAMPTZ,
  is_action_post BOOLEAN NOT NULL DEFAULT false,
  action_completed_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 post_media - Media đính kèm
CREATE TABLE public.post_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  media_type public.media_type NOT NULL,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 post_likes - Likes bài viết
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- 2.5 comments - Bình luận
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.6 comment_likes - Likes bình luận
CREATE TABLE public.comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- 2.7 post_follows - Theo dõi bài viết
CREATE TABLE public.post_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- 2.8 polls - Poll trong bài viết
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL UNIQUE REFERENCES public.posts(id) ON DELETE CASCADE,
  question VARCHAR(200) NOT NULL,
  is_multiple_choice BOOLEAN NOT NULL DEFAULT false,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.9 poll_options - Options của poll
CREATE TABLE public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_text VARCHAR(100) NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.10 poll_votes - Votes
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Indexes
-- =============================================

-- Posts indexes
CREATE INDEX idx_posts_category_activity ON public.posts(category_id, last_activity_at DESC);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_pinned ON public.posts(is_pinned, pinned_at DESC) WHERE is_pinned = true;
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);

-- Comments indexes
CREATE INDEX idx_comments_post ON public.comments(post_id, created_at DESC);
CREATE INDEX idx_comments_parent ON public.comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_author ON public.comments(author_id);

-- Likes indexes
CREATE INDEX idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX idx_post_likes_user ON public.post_likes(user_id);
CREATE INDEX idx_comment_likes_comment ON public.comment_likes(comment_id);

-- Polls indexes
CREATE INDEX idx_poll_options_poll ON public.poll_options(poll_id, order_index);
CREATE INDEX idx_poll_votes_poll_user ON public.poll_votes(poll_id, user_id);

-- Categories index
CREATE INDEX idx_categories_order ON public.categories(order_index);

-- Post follows index
CREATE INDEX idx_post_follows_user ON public.post_follows(user_id);

-- 4. Enable RLS
-- =============================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- =============================================

-- Categories policies
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- Posts policies
CREATE POLICY "Approved members can view posts"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.membership_requests
      WHERE user_id = auth.uid() AND status = 'approved'
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'owner')
  );

CREATE POLICY "Approved members can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND (
      EXISTS (
        SELECT 1 FROM public.membership_requests
        WHERE user_id = auth.uid() AND status = 'approved'
      )
      OR has_role(auth.uid(), 'admin')
      OR has_role(auth.uid(), 'owner')
    )
    AND (
      EXISTS (
        SELECT 1 FROM public.categories
        WHERE id = category_id AND post_permission = 'all'
      )
      OR has_role(auth.uid(), 'admin')
      OR has_role(auth.uid(), 'owner')
    )
  );

CREATE POLICY "Authors can update own posts"
  ON public.posts FOR UPDATE
  USING (
    auth.uid() = author_id
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'owner')
  );

CREATE POLICY "Authors can delete own posts"
  ON public.posts FOR DELETE
  USING (
    auth.uid() = author_id
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'owner')
  );

-- Post media policies
CREATE POLICY "Users can view post media"
  ON public.post_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_media.post_id
    )
  );

CREATE POLICY "Post authors can manage media"
  ON public.post_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_media.post_id AND author_id = auth.uid()
    )
  );

CREATE POLICY "Post authors can delete media"
  ON public.post_media FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_media.post_id AND author_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'owner')
  );

-- Post likes policies
CREATE POLICY "Anyone can view post likes"
  ON public.post_likes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can like posts"
  ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own likes"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Approved members can view comments"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.membership_requests
      WHERE user_id = auth.uid() AND status = 'approved'
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'owner')
  );

CREATE POLICY "Approved members can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND (
      EXISTS (
        SELECT 1 FROM public.membership_requests
        WHERE user_id = auth.uid() AND status = 'approved'
      )
      OR has_role(auth.uid(), 'admin')
      OR has_role(auth.uid(), 'owner')
    )
  );

CREATE POLICY "Authors can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments"
  ON public.comments FOR DELETE
  USING (
    auth.uid() = author_id
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'owner')
  );

-- Comment likes policies
CREATE POLICY "Anyone can view comment likes"
  ON public.comment_likes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can like comments"
  ON public.comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own comment likes"
  ON public.comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Post follows policies
CREATE POLICY "Users can view own follows"
  ON public.post_follows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can follow posts"
  ON public.post_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow posts"
  ON public.post_follows FOR DELETE
  USING (auth.uid() = user_id);

-- Polls policies
CREATE POLICY "Users can view polls"
  ON public.polls FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = polls.post_id
    )
  );

CREATE POLICY "Post authors can create polls"
  ON public.polls FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = polls.post_id AND author_id = auth.uid()
    )
  );

CREATE POLICY "Post authors can update polls"
  ON public.polls FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = polls.post_id AND author_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'owner')
  );

CREATE POLICY "Post authors can delete polls"
  ON public.polls FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = polls.post_id AND author_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'owner')
  );

-- Poll options policies
CREATE POLICY "Users can view poll options"
  ON public.poll_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.polls
      WHERE id = poll_options.poll_id
    )
  );

CREATE POLICY "Poll creators can manage options"
  ON public.poll_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.polls p
      JOIN public.posts po ON p.post_id = po.id
      WHERE p.id = poll_options.poll_id AND po.author_id = auth.uid()
    )
  );

CREATE POLICY "Poll creators can delete options"
  ON public.poll_options FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.polls p
      JOIN public.posts po ON p.post_id = po.id
      WHERE p.id = poll_options.poll_id AND po.author_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'owner')
  );

-- Poll votes policies
CREATE POLICY "Users can view poll votes"
  ON public.poll_votes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can vote"
  ON public.poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Trigger Functions
-- =============================================

-- Update post like count
CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update post comment count
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET comment_count = comment_count + 1,
        last_activity_at = now()
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update comment like count
CREATE OR REPLACE FUNCTION public.update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update poll option vote count
CREATE OR REPLACE FUNCTION public.update_poll_option_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.poll_options SET vote_count = vote_count + 1 WHERE id = NEW.option_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.poll_options SET vote_count = vote_count - 1 WHERE id = OLD.option_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update category post count
CREATE OR REPLACE FUNCTION public.update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.categories SET post_count = post_count - 1 WHERE id = OLD.category_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check poll vote allowed (single/multiple choice and expiry)
CREATE OR REPLACE FUNCTION public.check_poll_vote_allowed()
RETURNS TRIGGER AS $$
DECLARE
  poll_record RECORD;
  existing_vote_count INTEGER;
BEGIN
  SELECT * INTO poll_record FROM public.polls WHERE id = NEW.poll_id;
  
  -- Check if poll has ended
  IF poll_record.ends_at IS NOT NULL AND poll_record.ends_at < now() THEN
    RAISE EXCEPTION 'This poll has ended';
  END IF;
  
  -- Check single choice constraint
  IF NOT poll_record.is_multiple_choice THEN
    SELECT COUNT(*) INTO existing_vote_count
    FROM public.poll_votes
    WHERE poll_id = NEW.poll_id AND user_id = NEW.user_id;
    
    IF existing_vote_count > 0 THEN
      RAISE EXCEPTION 'You have already voted in this poll';
    END IF;
  END IF;
  
  -- Check duplicate vote on same option
  SELECT COUNT(*) INTO existing_vote_count
  FROM public.poll_votes
  WHERE poll_id = NEW.poll_id AND option_id = NEW.option_id AND user_id = NEW.user_id;
  
  IF existing_vote_count > 0 THEN
    RAISE EXCEPTION 'You have already voted for this option';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Create Triggers
-- =============================================

CREATE TRIGGER trigger_post_like_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_like_count();

CREATE TRIGGER trigger_post_comment_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();

CREATE TRIGGER trigger_comment_like_count
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_like_count();

CREATE TRIGGER trigger_poll_option_vote_count
  AFTER INSERT OR DELETE ON public.poll_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_poll_option_vote_count();

CREATE TRIGGER trigger_category_post_count
  AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_category_post_count();

CREATE TRIGGER trigger_check_poll_vote
  BEFORE INSERT ON public.poll_votes
  FOR EACH ROW EXECUTE FUNCTION public.check_poll_vote_allowed();

-- Updated_at triggers
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Enable Realtime
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;

-- 9. Seed Default Categories
-- =============================================

INSERT INTO public.categories (name, emoji, slug, description, post_permission, order_index) VALUES
  ('Thông báo', '📢', 'announcements', 'Thông báo từ admin', 'admin_only', 1),
  ('Hỏi đáp', '❓', 'qna', 'Đặt câu hỏi và nhận giải đáp', 'all', 2),
  ('Chia sẻ kinh nghiệm', '💡', 'share-experience', 'Chia sẻ kiến thức và kinh nghiệm', 'all', 3),
  ('Giới thiệu bản thân', '🎉', 'introductions', 'Làm quen với cộng đồng', 'all', 4),
  ('Tài liệu', '📚', 'resources', 'Tài liệu và nguồn học tập', 'all', 5),
  ('Action', '🎯', 'action', 'Bài tập hành động', 'all', 6);