-- Add prompt field to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS prompt TEXT;