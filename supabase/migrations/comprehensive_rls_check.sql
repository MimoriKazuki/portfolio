-- 1. Check ALL tables with RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND rowsecurity = true
ORDER BY tablename;

-- 2. Check ALL policies on ALL tables
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Specifically check projects table RLS status
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'projects';

-- 4. Check if there are any triggers or functions that might affect inserts
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'projects';

-- 5. Disable RLS on ALL related tables (temporary fix)
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_requests DISABLE ROW LEVEL SECURITY;

-- 6. Check Supabase auth status
SELECT auth.uid(), auth.role(), auth.jwt();

-- 7. Try to identify which specific operation is failing
-- Check if it's the storage operation that's failing
SELECT 
  id,
  name,
  public,
  created_at,
  updated_at
FROM storage.buckets
WHERE name = 'project-videos';

-- 8. Check storage policies
SELECT 
  id,
  name,
  bucket_id,
  definition,
  check_expression
FROM storage.policies
WHERE bucket_id = 'project-videos';