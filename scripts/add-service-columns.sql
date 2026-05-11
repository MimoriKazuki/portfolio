-- Add service selection columns to projects and columns tables
-- これらのカラムは詳細ページの右サイドバーに表示するサービスを指定するために使用されます

-- Add columns to projects table
ALTER TABLE projects 
ADD COLUMN enterprise_service TEXT DEFAULT 'comprehensive-ai-training',
ADD COLUMN individual_service TEXT DEFAULT 'individual-coaching';

-- Add columns to columns table
ALTER TABLE columns 
ADD COLUMN enterprise_service TEXT DEFAULT 'comprehensive-ai-training',
ADD COLUMN individual_service TEXT DEFAULT 'individual-coaching';

-- Update existing records to have default values (in case they were created before this migration)
UPDATE projects 
SET 
  enterprise_service = 'comprehensive-ai-training',
  individual_service = 'individual-coaching'
WHERE enterprise_service IS NULL OR individual_service IS NULL;

UPDATE columns 
SET 
  enterprise_service = 'comprehensive-ai-training',
  individual_service = 'individual-coaching'
WHERE enterprise_service IS NULL OR individual_service IS NULL;

-- Add comments to document what these columns are for
COMMENT ON COLUMN projects.enterprise_service IS 'ID of enterprise service to display in right sidebar';
COMMENT ON COLUMN projects.individual_service IS 'ID of individual service to display in right sidebar';
COMMENT ON COLUMN columns.enterprise_service IS 'ID of enterprise service to display in right sidebar';
COMMENT ON COLUMN columns.individual_service IS 'ID of individual service to display in right sidebar';