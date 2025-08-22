-- Check storage schema RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'storage'
ORDER BY tablename;

-- Check existing storage policies
SELECT 
  id,
  name,
  bucket_id,
  definition,
  check_expression
FROM storage.policies;

-- Check existing policies on storage.objects
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Drop all existing policies on project-videos bucket
DELETE FROM storage.policies WHERE bucket_id = 'project-videos';

-- Drop all RLS policies on storage.objects for project-videos
DROP POLICY IF EXISTS "Anyone can view project videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload project videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update project videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete project videos" ON storage.objects;

-- Create new, more permissive policies for project-videos bucket
CREATE POLICY "Allow public access to project videos" ON storage.objects
FOR SELECT USING (bucket_id = 'project-videos');

CREATE POLICY "Allow authenticated uploads to project videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-videos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated updates to project videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-videos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated deletes from project videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-videos' 
  AND auth.uid() IS NOT NULL
);

-- Alternative: Disable RLS on storage.objects (NOT RECOMMENDED for production)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;