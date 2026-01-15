ALTER TABLE public.course_lessons
ADD COLUMN description TEXT DEFAULT NULL,
ADD COLUMN discussion_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.course_lessons.description IS 'Short description for SEO (max 200 chars)';
COMMENT ON COLUMN public.course_lessons.discussion_post_id IS 'Linked community post for lesson discussion';