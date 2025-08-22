-- Check current enum values
SELECT enum_range(NULL::project_category);

-- Add 'video' to the project_category enum type
ALTER TYPE project_category ADD VALUE IF NOT EXISTS 'video';

-- Verify the change
SELECT enum_range(NULL::project_category);