-- Add audio_url column to columns table
ALTER TABLE columns
ADD COLUMN IF NOT EXISTS audio_url VARCHAR;

-- Add comment for clarity
COMMENT ON COLUMN columns.audio_url IS 'URL for audio file (.m4a) associated with the column';