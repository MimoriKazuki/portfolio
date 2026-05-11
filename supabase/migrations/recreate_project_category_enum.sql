-- Alternative approach if the above doesn't work
-- This recreates the enum type with all values

-- First, change the column type to text temporarily
ALTER TABLE projects ALTER COLUMN category TYPE text;

-- Drop the old enum type
DROP TYPE IF EXISTS project_category;

-- Create new enum type with all values including 'video'
CREATE TYPE project_category AS ENUM ('homepage', 'landing-page', 'web-app', 'mobile-app', 'video');

-- Change the column back to use the enum
ALTER TABLE projects ALTER COLUMN category TYPE project_category USING category::project_category;

-- Verify the change
SELECT enum_range(NULL::project_category);