-- Add is_featured column to columns table
ALTER TABLE columns
ADD COLUMN is_featured BOOLEAN DEFAULT false;