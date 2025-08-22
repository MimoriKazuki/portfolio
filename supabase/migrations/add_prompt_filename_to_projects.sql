-- Add prompt_filename column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS prompt_filename TEXT;