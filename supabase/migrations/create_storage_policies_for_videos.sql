-- Create RLS policies for project-videos bucket
-- These policies control access to the storage bucket

-- 1. Allow anyone to view files in project-videos bucket
CREATE POLICY "Give users access to view project videos" ON storage.objects
FOR SELECT 
USING (bucket_id = 'project-videos');

-- 2. Allow authenticated users to upload files to project-videos bucket
CREATE POLICY "Give authenticated users access to upload project videos" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'project-videos');

-- 3. Allow authenticated users to update their own uploaded files
CREATE POLICY "Give authenticated users access to update project videos" ON storage.objects
FOR UPDATE 
TO authenticated
USING (bucket_id = 'project-videos')
WITH CHECK (bucket_id = 'project-videos');

-- 4. Allow authenticated users to delete their own uploaded files
CREATE POLICY "Give authenticated users access to delete project videos" ON storage.objects
FOR DELETE 
TO authenticated
USING (bucket_id = 'project-videos');

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%project videos%'
ORDER BY policyname;