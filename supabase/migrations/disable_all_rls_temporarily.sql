-- Temporarily disable RLS on ALL tables for debugging
-- WARNING: This removes all security! Use only in development!

-- First, list all tables in public schema
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- List all tables with RLS enabled
SELECT 
  'ALTER TABLE ' || tablename || ' DISABLE ROW LEVEL SECURITY;' as disable_command,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND rowsecurity = true;

-- Disable RLS on existing tables only
DO $$
BEGIN
  -- Projects table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Columns table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'columns') THEN
    ALTER TABLE columns DISABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Documents table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documents') THEN
    ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Contacts table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contacts') THEN
    ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Document requests table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_requests') THEN
    ALTER TABLE document_requests DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Verify all RLS is disabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
ORDER BY tablename;