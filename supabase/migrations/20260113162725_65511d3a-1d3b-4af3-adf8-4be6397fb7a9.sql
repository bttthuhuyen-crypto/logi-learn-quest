-- Bảng lưu danh sách users bị ban vĩnh viễn
CREATE TABLE public.banned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  banned_by UUID,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_banned_users_user_id ON public.banned_users(user_id);
CREATE INDEX idx_banned_users_email ON public.banned_users(email);

-- RLS
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view banned users (correct argument order: user_id first, then role)
CREATE POLICY "Admins can view banned users" ON public.banned_users
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- Only admins can insert banned users
CREATE POLICY "Admins can ban users" ON public.banned_users
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- Only admins can delete (unban) users
CREATE POLICY "Admins can unban users" ON public.banned_users
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));