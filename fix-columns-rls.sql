-- コラムテーブルのRLSポリシーをプロジェクトテーブルと同じ設定に修正
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Authenticated users can insert columns" ON columns;
DROP POLICY IF EXISTS "Authenticated users can update columns" ON columns;
DROP POLICY IF EXISTS "Authenticated users can delete columns" ON columns;
DROP POLICY IF EXISTS "Enable read access for all users" ON columns;
DROP POLICY IF EXISTS "Columns are viewable by everyone" ON columns;

-- 新しいポリシーを作成（プロジェクトテーブルと同じ設定）
CREATE POLICY "Authenticated users can insert columns" 
ON columns FOR INSERT 
TO authenticated 
WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "Authenticated users can update columns" 
ON columns FOR UPDATE 
TO authenticated 
USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Authenticated users can delete columns" 
ON columns FOR DELETE 
TO authenticated 
USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "Enable read access for all users" 
ON columns FOR SELECT 
TO public 
USING (true);

-- RLSが有効になっていることを確認
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;