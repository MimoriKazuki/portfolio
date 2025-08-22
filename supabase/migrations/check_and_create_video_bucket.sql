-- Check existing buckets
SELECT * FROM storage.buckets;

-- Create project-videos bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'project-videos') THEN
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES (
      'project-videos',
      'project-videos',
      true,
      false,
      104857600, -- 100MB
      ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    );
  END IF;
END $$;