-- Create storage bucket for notice thumbnails if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'notice-thumbnails',
  'notice-thumbnails',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for notice thumbnails
CREATE POLICY "Anyone can view notice thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'notice-thumbnails');

CREATE POLICY "Authenticated users can upload notice thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'notice-thumbnails' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update notice thumbnails" ON storage.objects
  FOR UPDATE WITH CHECK (
    bucket_id = 'notice-thumbnails' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete notice thumbnails" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'notice-thumbnails' AND
    auth.role() = 'authenticated'
  );