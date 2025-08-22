-- Check all policies related to storage
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
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;

-- Check if project-videos bucket exists
SELECT * FROM storage.buckets WHERE id = 'project-videos';

-- Check current user permissions
SELECT current_user, session_user;