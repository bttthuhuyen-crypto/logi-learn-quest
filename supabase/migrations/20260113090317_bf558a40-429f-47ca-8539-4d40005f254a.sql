-- Create enum for lesson access levels
CREATE TYPE public.lesson_access_level AS ENUM ('public', 'member', 'level');

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_paid BOOLEAN DEFAULT false,
  price DECIMAL(10,2) DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  cta_text TEXT DEFAULT 'VÀO HỌC NGAY',
  introduction_content TEXT,
  order_index INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Course sections table
CREATE TABLE public.course_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Course lessons table
CREATE TABLE public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.course_sections(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  access_level lesson_access_level DEFAULT 'member',
  required_level INT DEFAULT 1,
  is_published BOOLEAN DEFAULT false,
  duration_seconds INT DEFAULT 0,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can view all courses" ON public.courses
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- RLS Policies for course_sections
CREATE POLICY "Anyone can view sections of published courses" ON public.course_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id AND is_published = true
    )
  );

CREATE POLICY "Admins can view all sections" ON public.course_sections
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can manage sections" ON public.course_sections
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- RLS Policies for course_lessons
CREATE POLICY "Public lessons viewable by all" ON public.course_lessons
  FOR SELECT USING (
    access_level = 'public' AND is_published = true AND
    EXISTS (
      SELECT 1 FROM public.course_sections cs
      JOIN public.courses c ON c.id = cs.course_id
      WHERE cs.id = section_id AND c.is_published = true
    )
  );

CREATE POLICY "Member lessons viewable by approved members" ON public.course_lessons
  FOR SELECT USING (
    access_level = 'member' AND is_published = true AND
    EXISTS (
      SELECT 1 FROM public.membership_requests
      WHERE user_id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Level lessons viewable by qualified members" ON public.course_lessons
  FOR SELECT USING (
    access_level = 'level' AND is_published = true AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND level >= required_level
    )
  );

CREATE POLICY "Admins can view all lessons" ON public.course_lessons
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can manage lessons" ON public.course_lessons
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- Triggers for updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_sections_updated_at
  BEFORE UPDATE ON public.course_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON public.course_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for course assets
INSERT INTO storage.buckets (id, name, public) VALUES ('course-assets', 'course-assets', true);

-- Storage policies for course assets
CREATE POLICY "Anyone can view course assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-assets');

CREATE POLICY "Admins can upload course assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'course-assets' AND
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'))
  );

CREATE POLICY "Admins can update course assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'course-assets' AND
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'))
  );

CREATE POLICY "Admins can delete course assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'course-assets' AND
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'))
  );