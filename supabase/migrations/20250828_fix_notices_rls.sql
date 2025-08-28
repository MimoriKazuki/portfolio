-- Drop existing policies
DROP POLICY IF EXISTS "Public notices are viewable by everyone" ON notices;
DROP POLICY IF EXISTS "Authenticated users can manage notices" ON notices;

-- Create new RLS policies for notices table
-- Allow anyone to view published notices
CREATE POLICY "Anyone can view published notices" ON notices
  FOR SELECT 
  USING (is_published = true);

-- Allow authenticated users to do everything
CREATE POLICY "Authenticated users can do everything" ON notices
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');