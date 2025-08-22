-- TEMPORARY SOLUTION: Disable RLS on storage.objects
-- WARNING: This removes all storage security! Use only in development!

ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'storage' AND tablename = 'objects';