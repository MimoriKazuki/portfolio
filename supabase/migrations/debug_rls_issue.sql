-- 1. Check current RLS status on projects table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'projects';

-- 2. List all policies on projects table
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
WHERE tablename = 'projects';

-- 3. Check current user and role
SELECT 
  current_user,
  current_role,
  auth.uid() as auth_uid,
  auth.role() as auth_role,
  auth.jwt() as jwt_claims;

-- 4. Test if you can insert without RLS
-- First disable RLS
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- 5. Alternative: Create a more permissive policy for testing
-- Re-enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON projects;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON projects;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON projects;

-- Create very permissive policies (for testing only!)
CREATE POLICY "Allow all operations for authenticated users" ON projects
FOR ALL USING (true) WITH CHECK (true);

-- Or if you need service role access:
CREATE POLICY "Allow service role full access" ON projects
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 6. If nothing else works, disable RLS completely
-- ALTER TABLE projects DISABLE ROW LEVEL SECURITY;