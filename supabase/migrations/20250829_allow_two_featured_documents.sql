-- Drop the old trigger that limits featured documents to 1
DROP TRIGGER IF EXISTS enforce_single_featured_document_trigger ON documents;
DROP FUNCTION IF EXISTS enforce_single_featured_document();

-- Create new function that allows up to 2 featured documents
CREATE OR REPLACE FUNCTION enforce_two_featured_documents()
RETURNS TRIGGER AS $$
DECLARE
  current_featured_count INTEGER;
BEGIN
  -- Only check if we're setting is_featured to true
  IF NEW.is_featured = true THEN
    -- Count current featured documents (excluding the current row if it's an update)
    SELECT COUNT(*) INTO current_featured_count
    FROM documents
    WHERE is_featured = true
      AND id != NEW.id;
    
    -- If we already have 2 featured documents, prevent this update/insert
    IF current_featured_count >= 2 THEN
      RAISE EXCEPTION 'Maximum of 2 featured documents allowed';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger that enforces the 2-document limit
CREATE TRIGGER enforce_two_featured_documents_trigger
BEFORE INSERT OR UPDATE OF is_featured ON documents
FOR EACH ROW
WHEN (NEW.is_featured = true)
EXECUTE FUNCTION enforce_two_featured_documents();

-- Add a comment to explain the business rule
COMMENT ON FUNCTION enforce_two_featured_documents() IS 'Ensures that only up to 2 documents can be marked as featured at any time';