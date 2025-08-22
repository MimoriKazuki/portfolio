-- Add is_featured column to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_documents_is_featured ON documents(is_featured);

-- Ensure only one document can be featured at a time
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

-- Create trigger
DROP TRIGGER IF EXISTS enforce_single_featured_document_trigger ON documents;
CREATE TRIGGER enforce_single_featured_document_trigger
BEFORE INSERT OR UPDATE OF is_featured ON documents
FOR EACH ROW
WHEN (NEW.is_featured = true)
EXECUTE FUNCTION enforce_single_featured_document();