-- Create table for payment QR settings
CREATE TABLE public.payment_qr_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  account_holder text NOT NULL,
  account_number text NOT NULL,
  qr_image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_qr_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active payment settings
CREATE POLICY "Anyone can view active payment settings" ON public.payment_qr_settings
FOR SELECT USING (is_active = true);

-- Only admins can manage payment settings
CREATE POLICY "Admins can manage payment settings" ON public.payment_qr_settings
FOR ALL USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner')
);

-- Insert default payment settings
INSERT INTO public.payment_qr_settings (bank_name, account_holder, account_number, qr_image_url)
VALUES ('TECHCOMBANK', 'TRAN THI THU HUYEN', '1903 3087 4330 11', NULL);