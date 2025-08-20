-- まず既存のポリシーをすべて削除
DROP POLICY IF EXISTS "Public columns are viewable by everyone" ON columns;
DROP POLICY IF EXISTS "Authenticated users can manage columns" ON columns;
DROP POLICY IF EXISTS "Authenticated users can insert columns" ON columns;
DROP POLICY IF EXISTS "Authenticated users can update columns" ON columns;
DROP POLICY IF EXISTS "Authenticated users can delete columns" ON columns;
DROP POLICY IF EXISTS "Enable read access for all users" ON columns;
DROP POLICY IF EXISTS "Columns are viewable by everyone" ON columns;

DROP POLICY IF EXISTS "Active documents are viewable by everyone" ON documents;
DROP POLICY IF EXISTS "Authenticated users can manage documents" ON documents;
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON documents;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON documents;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON documents;
DROP POLICY IF EXISTS "Enable read access for all users" ON documents;
DROP POLICY IF EXISTS "Documents are viewable by everyone" ON documents;

-- columnsテーブルのRLSポリシー（projectsテーブルと完全に同じ）
CREATE POLICY "Authenticated users can delete columns" 
ON columns FOR DELETE 
TO public 
USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Authenticated users can insert columns" 
ON columns FOR INSERT 
TO public 
WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "Authenticated users can update columns" 
ON columns FOR UPDATE 
TO public 
USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Enable read access for all users" 
ON columns FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Columns are viewable by everyone" 
ON columns FOR SELECT 
TO public 
USING (true);

-- documentsテーブルのRLSポリシー（projectsテーブルと完全に同じ）
CREATE POLICY "Authenticated users can delete documents" 
ON documents FOR DELETE 
TO public 
USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Authenticated users can insert documents" 
ON documents FOR INSERT 
TO public 
WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "Authenticated users can update documents" 
ON documents FOR UPDATE 
TO public 
USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Enable read access for all users" 
ON documents FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Documents are viewable by everyone" 
ON documents FOR SELECT 
TO public 
USING (true);

-- RLSが有効になっていることを確認
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;