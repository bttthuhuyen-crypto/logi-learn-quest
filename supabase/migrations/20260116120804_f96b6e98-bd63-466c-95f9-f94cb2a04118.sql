-- Add new columns to communities table
ALTER TABLE communities ADD COLUMN IF NOT EXISTS category TEXT DEFAULT NULL;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS price_period TEXT DEFAULT 'month';
ALTER TABLE communities ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Update existing community
UPDATE communities 
SET name = '10X LOGISTICS', 
    description = 'Cộng đồng Logistics hàng đầu Việt Nam',
    category = 'logistics'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Create community_categories table
CREATE TABLE IF NOT EXISTS community_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  emoji VARCHAR,
  slug VARCHAR NOT NULL UNIQUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE community_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view categories
CREATE POLICY "Anyone can view categories" ON community_categories FOR SELECT USING (true);

-- Insert default categories
INSERT INTO community_categories (name, emoji, slug, order_index) VALUES
  ('Logistics', '📦', 'logistics', 1),
  ('Business', '💼', 'business', 2),
  ('Technology', '💻', 'technology', 3),
  ('Marketing', '📈', 'marketing', 4),
  ('Education', '📚', 'education', 5)
ON CONFLICT (slug) DO NOTHING;