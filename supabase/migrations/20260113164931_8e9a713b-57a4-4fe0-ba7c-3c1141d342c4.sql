-- Create invite_links table for shareable invite links
CREATE TABLE public.invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  code VARCHAR(32) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  use_count INTEGER DEFAULT 0,
  role public.community_role DEFAULT 'member',
  custom_message TEXT,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create invite_logs table for tracking all invites
CREATE TABLE public.invite_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_link_id UUID REFERENCES public.invite_links(id) ON DELETE SET NULL,
  email VARCHAR(255),
  invite_type VARCHAR(20) NOT NULL CHECK (invite_type IN ('email', 'link', 'csv')),
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'clicked', 'joined', 'failed')),
  invited_by UUID,
  invited_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  clicked_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for invite_links - admin only
CREATE POLICY "Admins can view all invite links"
ON public.invite_links
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can create invite links"
ON public.invite_links
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can update invite links"
ON public.invite_links
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- RLS policies for invite_logs - admin only
CREATE POLICY "Admins can view all invite logs"
ON public.invite_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can create invite logs"
ON public.invite_logs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can update invite logs"
ON public.invite_logs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- Function to generate unique invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..12 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;

    SELECT EXISTS(SELECT 1 FROM public.invite_links WHERE code = result) INTO code_exists;

    IF NOT code_exists THEN
      RETURN result;
    END IF;
  END LOOP;
END;
$$;

-- Enable realtime for invite tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.invite_links;