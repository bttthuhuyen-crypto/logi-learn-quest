
-- Create enums for affiliate system
CREATE TYPE public.referral_status AS ENUM ('pending', 'confirmed', 'paid', 'reversed');
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'rejected');

-- 1. affiliate_settings - Global affiliate configuration
CREATE TABLE public.affiliate_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  default_commission_rate INTEGER NOT NULL DEFAULT 30,
  cookie_duration_days INTEGER NOT NULL DEFAULT 14,
  pending_period_days INTEGER NOT NULL DEFAULT 14,
  min_payout_amount INTEGER NOT NULL DEFAULT 100000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. course_affiliate_settings - Per-course commission overrides
CREATE TABLE public.course_affiliate_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  commission_rate INTEGER,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id)
);

-- 3. affiliate_links - Unique referral codes for each user
CREATE TABLE public.affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  referral_code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. referral_clicks - Track link clicks
CREATE TABLE public.referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID NOT NULL REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  landing_page TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. referrals - Successful referral transactions
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  order_amount INTEGER NOT NULL DEFAULT 0,
  commission_rate INTEGER NOT NULL,
  commission_amount INTEGER NOT NULL,
  status public.referral_status NOT NULL DEFAULT 'pending',
  pending_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. affiliate_balances - User balance tracking
CREATE TABLE public.affiliate_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_earned INTEGER NOT NULL DEFAULT 0,
  pending_amount INTEGER NOT NULL DEFAULT 0,
  available_amount INTEGER NOT NULL DEFAULT 0,
  total_withdrawn INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. payout_requests - Withdrawal requests
CREATE TABLE public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  bank_account_number VARCHAR(50) NOT NULL,
  bank_account_name VARCHAR(100) NOT NULL,
  bank_branch VARCHAR(200),
  status public.payout_status NOT NULL DEFAULT 'pending',
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. notifications - In-app notification system
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.affiliate_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_affiliate_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_settings
CREATE POLICY "Anyone can view affiliate settings" ON public.affiliate_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage affiliate settings" ON public.affiliate_settings
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- RLS Policies for course_affiliate_settings
CREATE POLICY "Anyone can view course affiliate settings" ON public.course_affiliate_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage course affiliate settings" ON public.course_affiliate_settings
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- RLS Policies for affiliate_links
CREATE POLICY "Users can view own affiliate link" ON public.affiliate_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affiliate link" ON public.affiliate_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all affiliate links" ON public.affiliate_links
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

CREATE POLICY "Anyone can view affiliate links by code" ON public.affiliate_links
  FOR SELECT USING (true);

-- RLS Policies for referral_clicks (allow anonymous tracking)
CREATE POLICY "Anyone can insert clicks" ON public.referral_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all clicks" ON public.referral_clicks
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

CREATE POLICY "Users can view clicks on their links" ON public.referral_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.affiliate_links
      WHERE affiliate_links.id = referral_clicks.affiliate_link_id
      AND affiliate_links.user_id = auth.uid()
    )
  );

-- RLS Policies for referrals
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = affiliate_id);

CREATE POLICY "Admins can view all referrals" ON public.referrals
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can manage referrals" ON public.referrals
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- RLS Policies for affiliate_balances
CREATE POLICY "Users can view own balance" ON public.affiliate_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all balances" ON public.affiliate_balances
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can manage balances" ON public.affiliate_balances
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- RLS Policies for payout_requests
CREATE POLICY "Users can view own payout requests" ON public.payout_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payout requests" ON public.payout_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payout requests" ON public.payout_requests
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can manage payout requests" ON public.payout_requests
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage notifications" ON public.notifications
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- Create indexes for performance
CREATE INDEX idx_affiliate_links_user_id ON public.affiliate_links(user_id);
CREATE INDEX idx_affiliate_links_referral_code ON public.affiliate_links(referral_code);
CREATE INDEX idx_referral_clicks_affiliate_link_id ON public.referral_clicks(affiliate_link_id);
CREATE INDEX idx_referral_clicks_clicked_at ON public.referral_clicks(clicked_at);
CREATE INDEX idx_referrals_affiliate_id ON public.referrals(affiliate_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_referrals_pending_until ON public.referrals(pending_until);
CREATE INDEX idx_affiliate_balances_user_id ON public.affiliate_balances(user_id);
CREATE INDEX idx_payout_requests_user_id ON public.payout_requests(user_id);
CREATE INDEX idx_payout_requests_status ON public.payout_requests(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Create updated_at triggers
CREATE TRIGGER update_affiliate_settings_updated_at
  BEFORE UPDATE ON public.affiliate_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_balances_updated_at
  BEFORE UPDATE ON public.affiliate_balances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default affiliate settings
INSERT INTO public.affiliate_settings (is_enabled, default_commission_rate, cookie_duration_days, pending_period_days, min_payout_amount)
VALUES (false, 30, 14, 14, 100000);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM public.affiliate_links WHERE referral_code = result) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN result;
    END IF;
  END LOOP;
END;
$$;

-- Function to create affiliate link for user
CREATE OR REPLACE FUNCTION public.create_affiliate_link_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.affiliate_links (user_id, referral_code)
  VALUES (NEW.id, generate_referral_code());
  
  INSERT INTO public.affiliate_balances (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create affiliate link when user registers
CREATE TRIGGER on_auth_user_created_affiliate
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_affiliate_link_for_user();
