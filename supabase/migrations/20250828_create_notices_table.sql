-- Create notices table for announcements
CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  category VARCHAR NOT NULL CHECK (category IN ('news', 'update', 'maintenance', 'campaign', 'other')),
  site_url VARCHAR,
  thumbnail VARCHAR,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notices_updated_at BEFORE UPDATE
  ON notices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_notices_published ON notices(is_published, published_date DESC);
CREATE INDEX idx_notices_category ON notices(category);
CREATE INDEX idx_notices_featured ON notices(is_featured);

-- Add RLS policies
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Policy for viewing published notices (all users)
CREATE POLICY "Public notices are viewable by everyone" ON notices
  FOR SELECT USING (is_published = true);

-- Policy for authenticated users (admin)
CREATE POLICY "Authenticated users can manage notices" ON notices
  FOR ALL USING (auth.role() = 'authenticated');