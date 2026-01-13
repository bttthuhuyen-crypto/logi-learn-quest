-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for post-media bucket
CREATE POLICY "Authenticated users can upload post media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'post-media');

CREATE POLICY "Anyone can view post media"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'post-media');

CREATE POLICY "Users can update own post media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own post media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);