-- Check if is_featured column exists in documents table
-- If not, add it with the trigger to ensure only one featured document

-- First, check if the column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'is_featured'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE documents 
        ADD COLUMN is_featured BOOLEAN DEFAULT false;
        
        -- Create index for performance
        CREATE INDEX idx_documents_is_featured ON documents(is_featured);
    END IF;
END $$;

-- Create or replace the function to ensure only one featured document
CREATE OR REPLACE FUNCTION enforce_single_featured_document()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_featured = true THEN
    -- Set all other documents to not featured
    UPDATE documents 
    SET is_featured = false 
    WHERE id != NEW.id AND is_featured = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS enforce_single_featured_document_trigger ON documents;

CREATE TRIGGER enforce_single_featured_document_trigger
BEFORE INSERT OR UPDATE OF is_featured ON documents
FOR EACH ROW
WHEN (NEW.is_featured = true)
EXECUTE FUNCTION enforce_single_featured_document();

-- Verify the column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'documents' AND column_name = 'is_featured';