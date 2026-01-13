-- Create post_reports table
CREATE TABLE public.post_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reason public.report_reason NOT NULL,
  description TEXT,
  status public.report_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable RLS
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create post reports"
ON public.post_reports
FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view their own post reports"
ON public.post_reports
FOR SELECT
USING (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all post reports"
ON public.post_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'moderator')
  )
);

-- Admins can update reports
CREATE POLICY "Admins can update post reports"
ON public.post_reports
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'moderator')
  )
);

-- Create index for faster queries
CREATE INDEX idx_post_reports_post_id ON public.post_reports(post_id);
CREATE INDEX idx_post_reports_status ON public.post_reports(status);
CREATE INDEX idx_post_reports_created_at ON public.post_reports(created_at DESC);