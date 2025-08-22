-- Add type column to contacts table
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS type TEXT;

-- Add metadata column to store additional information (JSON)
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS metadata JSONB;