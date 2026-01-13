-- Create enum for question types
CREATE TYPE public.question_type AS ENUM ('text', 'multiple_choice', 'email');

-- Create enum for membership request status
CREATE TYPE public.membership_status AS ENUM ('pending', 'approved', 'declined');

-- Membership Questions table
CREATE TABLE public.membership_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_text_en TEXT,
  question_type question_type NOT NULL DEFAULT 'text',
  options JSONB DEFAULT '[]',
  order_index INT NOT NULL DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Membership Requests table
CREATE TABLE public.membership_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status membership_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Membership Answers table
CREATE TABLE public.membership_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.membership_requests(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.membership_questions(id) ON DELETE CASCADE NOT NULL,
  answer_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Community Settings table for storing global settings like auto-approve
CREATE TABLE public.community_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.membership_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for membership_questions
CREATE POLICY "Anyone can view questions" ON public.membership_questions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage questions" ON public.membership_questions
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- RLS Policies for membership_requests
CREATE POLICY "Users can view own request" ON public.membership_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own request" ON public.membership_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests" ON public.membership_requests
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can update requests" ON public.membership_requests
  FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- RLS Policies for membership_answers
CREATE POLICY "Users can view own answers" ON public.membership_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.membership_requests 
      WHERE id = request_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own answers" ON public.membership_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.membership_requests 
      WHERE id = request_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all answers" ON public.membership_answers
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- RLS Policies for community_settings
CREATE POLICY "Anyone can view settings" ON public.community_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON public.community_settings
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- Triggers for updated_at
CREATE TRIGGER update_membership_questions_updated_at
  BEFORE UPDATE ON public.membership_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_settings_updated_at
  BEFORE UPDATE ON public.community_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default membership questions for 10X Logistics
INSERT INTO public.membership_questions (question_text, question_text_en, question_type, options, order_index) VALUES
(
  'Bạn đang làm việc trong lĩnh vực nào?',
  'What is your current field of work?',
  'multiple_choice',
  '["Logistics / Xuất nhập khẩu", "Freight Forwarding / Giao nhận vận tải", "Warehouse / Kho bãi", "E-commerce / Thương mại điện tử", "Supply Chain / Chuỗi cung ứng", "Sinh viên / Đang tìm hiểu ngành", "Chuyển ngành / Career switcher", "Khác"]',
  0
),
(
  'Bạn mong muốn đạt được điều gì khi tham gia cộng đồng 10X Logistics?',
  'What do you hope to achieve by joining 10X Logistics?',
  'text',
  '[]',
  1
),
(
  'Bạn biết đến 10X Logistics từ đâu?',
  'How did you hear about 10X Logistics?',
  'multiple_choice',
  '["Facebook", "YouTube", "TikTok", "LinkedIn", "Google Search", "Bạn bè / Đồng nghiệp giới thiệu", "Sự kiện / Workshop", "Khác"]',
  2
);

-- Insert default community settings
INSERT INTO public.community_settings (key, value) VALUES
('membership_questions_enabled', 'true'),
('auto_approve', 'false');