-- For production use - proper RLS policies
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON projects;

-- Create new policies
-- Everyone can view projects
CREATE POLICY "Public projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert projects" ON projects
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update projects" ON projects
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  );

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete projects" ON projects
  FOR DELETE USING (
    auth.uid() IS NOT NULL
  );