-- Create bucket for project videos
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'project-videos',
  'project-videos',
  true,
  false,
  104857600, -- 100MB
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view project videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload project videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update project videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete project videos" ON storage.objects;

-- Enable RLS
CREATE POLICY "Anyone can view project videos" ON storage.objects
FOR SELECT USING (bucket_id = 'project-videos');

CREATE POLICY "Authenticated users can upload project videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'project-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update project videos" ON storage.objects
FOR UPDATE WITH CHECK (bucket_id = 'project-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete project videos" ON storage.objects
FOR DELETE USING (bucket_id = 'project-videos' AND auth.role() = 'authenticated');