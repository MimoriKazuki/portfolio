-- Remove NOT NULL constraint from slug column in columns table
ALTER TABLE columns 
ALTER COLUMN slug DROP NOT NULL;

-- Optional: Add a comment to indicate that slug is no longer used
COMMENT ON COLUMN columns.slug IS 'Deprecated: No longer used. Columns are now referenced by ID.';