-- ストレージバケットの作成
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('column-thumbnails', 'column-thumbnails', true),
  ('document-thumbnails', 'document-thumbnails', true),
  ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Access 2" ON storage.objects;
DROP POLICY IF EXISTS "Public Access 3" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload column thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update column thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete column thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload document thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update document thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete document thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;

-- column-thumbnailsバケットのRLSポリシー
CREATE POLICY "Column Thumbnails Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'column-thumbnails');

CREATE POLICY "Column Thumbnails Auth Upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'column-thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Column Thumbnails Auth Update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'column-thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Column Thumbnails Auth Delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'column-thumbnails' AND auth.role() = 'authenticated');

-- document-thumbnailsバケットのRLSポリシー
CREATE POLICY "Document Thumbnails Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'document-thumbnails');

CREATE POLICY "Document Thumbnails Auth Upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'document-thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Document Thumbnails Auth Update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'document-thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Document Thumbnails Auth Delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'document-thumbnails' AND auth.role() = 'authenticated');

-- documentsバケットのRLSポリシー
CREATE POLICY "Documents Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Documents Auth Upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Documents Auth Update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Documents Auth Delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');