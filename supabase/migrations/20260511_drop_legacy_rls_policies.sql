-- 旧 RLS ポリシーの除去（20260511_enable_rls_5_tables.sql の補完）
--
-- 背景:
--   20260511_enable_rls_5_tables.sql で 5テーブルの RLS 有効化と新ポリシー設計を行ったが、
--   DROP POLICY IF EXISTS のリストが本番DBの旧ポリシー名と一致しておらず、
--   19件の旧ポリシーが残存していた。
--
-- 問題:
--   PostgreSQL の RLS は PERMISSIVE ポリシーを OR 結合で評価するため、
--   旧ポリシー（多くは {public} ロール対象）が新ポリシーと共存することで、
--   新ポリシーで意図した制限が機能しない状態だった。
--
-- 対応:
--   検証で発見された旧19件を本ファイルで DROP し、新12件のみが残る状態にする。
--   新ポリシーは既に投入済で、本番動作への影響はない。

-- ============================================================
-- columns 旧ポリシー除去（5件）
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can delete columns" ON columns;
DROP POLICY IF EXISTS "Authenticated users can insert columns" ON columns;
DROP POLICY IF EXISTS "Columns are viewable by everyone" ON columns;
DROP POLICY IF EXISTS "Enable read access for all users" ON columns;
DROP POLICY IF EXISTS "Authenticated users can update columns" ON columns;

-- ============================================================
-- projects 旧ポリシー除去（7件）
-- ============================================================
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON projects;
DROP POLICY IF EXISTS "Allow service role full access" ON projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Public projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON projects;

-- ============================================================
-- documents 旧ポリシー除去（5件）
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON documents;
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON documents;
DROP POLICY IF EXISTS "Documents are viewable by everyone" ON documents;
DROP POLICY IF EXISTS "Enable read access for all users" ON documents;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON documents;

-- ============================================================
-- document_requests 旧ポリシー除去（1件）
-- ============================================================
DROP POLICY IF EXISTS "Anyone can create document requests" ON document_requests;

-- ============================================================
-- contacts 旧ポリシー除去（2件）
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON contacts;
