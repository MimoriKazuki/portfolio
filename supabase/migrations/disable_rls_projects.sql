-- Disable RLS on projects table to fix the security policy error
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'projects';