-- Create location_source enum
CREATE TYPE public.location_source AS ENUM ('auto_ip', 'manual', 'gps');

-- Create user_locations table
CREATE TABLE public.user_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  
  -- Coordinates (with privacy noise applied)
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- Original location info for display
  city VARCHAR(100),
  region VARCHAR(100),
  country VARCHAR(100),
  country_code VARCHAR(2),
  display_name VARCHAR(200),
  
  -- Privacy settings
  is_visible BOOLEAN NOT NULL DEFAULT true,
  location_source public.location_source NOT NULL DEFAULT 'auto_ip',
  privacy_noise_applied BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for geospatial queries
CREATE INDEX idx_user_locations_coords ON public.user_locations(latitude, longitude);
CREATE INDEX idx_user_locations_community ON public.user_locations(community_id, is_visible);

-- Create location_settings table
CREATE TABLE public.location_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID UNIQUE REFERENCES public.communities(id) ON DELETE CASCADE,
  map_enabled BOOLEAN NOT NULL DEFAULT false,
  default_zoom INTEGER NOT NULL DEFAULT 2,
  default_center_lat DECIMAL(10,8),
  default_center_lng DECIMAL(11,8),
  show_member_count BOOLEAN NOT NULL DEFAULT true,
  allow_nearby_search BOOLEAN NOT NULL DEFAULT true,
  nearby_radius_options JSONB NOT NULL DEFAULT '[10, 25, 50, 100, 500]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_location_settings_updated_at
  BEFORE UPDATE ON public.location_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to add privacy noise to coordinates
CREATE OR REPLACE FUNCTION public.add_location_noise(
  lat DECIMAL,
  lng DECIMAL,
  noise_km INTEGER DEFAULT 16
) RETURNS TABLE(noisy_lat DECIMAL, noisy_lng DECIMAL)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  noise_degrees DECIMAL;
  random_angle DECIMAL;
  random_distance DECIMAL;
BEGIN
  -- Convert km to approximate degrees (1 degree ≈ 111km)
  noise_degrees := noise_km / 111.0;
  
  -- Random angle and distance
  random_angle := random() * 2 * PI();
  random_distance := random() * noise_degrees;
  
  noisy_lat := lat + (random_distance * COS(random_angle));
  noisy_lng := lng + (random_distance * SIN(random_angle));
  
  RETURN NEXT;
END;
$$;

-- Function to find nearby members using Haversine formula
CREATE OR REPLACE FUNCTION public.get_nearby_members(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_km INTEGER,
  community_uuid UUID,
  limit_count INTEGER DEFAULT 50
) RETURNS TABLE(
  user_id UUID,
  distance_km DECIMAL,
  latitude DECIMAL,
  longitude DECIMAL,
  display_name VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ul.user_id,
    (6371 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(user_lat)) * cos(radians(ul.latitude)) 
        * cos(radians(ul.longitude) - radians(user_lng)) 
        + sin(radians(user_lat)) * sin(radians(ul.latitude))
      ))
    ))::DECIMAL as distance_km,
    ul.latitude,
    ul.longitude,
    ul.display_name
  FROM public.user_locations ul
  WHERE ul.community_id = community_uuid
    AND ul.is_visible = true
    AND ul.latitude IS NOT NULL
    AND ul.longitude IS NOT NULL
    AND (6371 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(user_lat)) * cos(radians(ul.latitude)) 
        * cos(radians(ul.longitude) - radians(user_lng)) 
        + sin(radians(user_lat)) * sin(radians(ul.latitude))
      ))
    )) <= radius_km
  ORDER BY 2
  LIMIT limit_count;
END;
$$;

-- Enable RLS on user_locations
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

-- Users can view their own location
CREATE POLICY "Users can view own location"
ON public.user_locations FOR SELECT
USING (auth.uid() = user_id);

-- Members can view visible locations in their community
CREATE POLICY "Members can view visible community locations"
ON public.user_locations FOR SELECT
USING (
  is_visible = true 
  AND EXISTS (
    SELECT 1 FROM public.community_members cm 
    WHERE cm.community_id = user_locations.community_id 
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
  )
);

-- Users can insert their own location
CREATE POLICY "Users can insert own location"
ON public.user_locations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own location
CREATE POLICY "Users can update own location"
ON public.user_locations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own location
CREATE POLICY "Users can delete own location"
ON public.user_locations FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on location_settings
ALTER TABLE public.location_settings ENABLE ROW LEVEL SECURITY;

-- Members can view location settings for their community
CREATE POLICY "Members can view location settings"
ON public.location_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.community_members cm 
    WHERE cm.community_id = location_settings.community_id 
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
  )
);

-- Admins can insert location settings
CREATE POLICY "Admins can insert location settings"
ON public.location_settings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'owner')
  )
);

-- Admins can update location settings
CREATE POLICY "Admins can update location settings"
ON public.location_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'owner')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'owner')
  )
);