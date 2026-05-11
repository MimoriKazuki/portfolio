-- Step 1: Remove the default constraint first
ALTER TABLE projects ALTER COLUMN category DROP DEFAULT;

-- Step 2: Change the column type to text temporarily
ALTER TABLE projects ALTER COLUMN category TYPE text;

-- Step 3: Drop the old enum type
DROP TYPE IF EXISTS project_category;

-- Step 4: Create new enum type with all values including 'video'
CREATE TYPE project_category AS ENUM ('homepage', 'landing-page', 'web-app', 'mobile-app', 'video');

-- Step 5: Change the column back to use the enum
ALTER TABLE projects ALTER COLUMN category TYPE project_category USING category::project_category;

-- Step 6: Add the default back if needed
ALTER TABLE projects ALTER COLUMN category SET DEFAULT 'homepage';

-- Verify the change
SELECT enum_range(NULL::project_category);

-- Check the column definition
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'projects' AND column_name = 'category';