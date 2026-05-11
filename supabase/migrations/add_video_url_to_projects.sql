-- Add video_url column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN projects.video_url IS 'URL for explanation video (YouTube, Vimeo, etc.)';