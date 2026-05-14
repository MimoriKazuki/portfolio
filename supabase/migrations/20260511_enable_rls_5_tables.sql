-- 5テーブルのRLS有効化（projects / columns / documents / document_requests / contacts）
--
-- 背景:
--   現状、これら5テーブルは RLS 無効で anon キーで誰でも読み書き可能な状態。
--   Supabase Advisory（rls_disabled・priority 1・critical）でも警告中。
--
-- 方針（ディレクター承認済・A案）:
--   1. 全5テーブルで RLS 有効化
--   2. 公開コンテンツ（projects/columns/documents）: anon に SELECT 許可
--      ・documents は is_active = true のみ公開
--   3. 受信系個人情報（document_requests/contacts）: anon に INSERT のみ許可
--   4. 全テーブル authenticated（管理画面ログイン済）には ALL 許可
--   5. service_role は RLS をバイパスするためポリシー定義不要
--
-- 暫定対応:
--   columns.view_count（公開ページから anon UPDATE）
--   documents.download_count（API Route から anon UPDATE）
--   これら維持のため、columns と documents は anon UPDATE 許可
--   後日 RPC 関数化（SECURITY DEFINER）で完全対応する（別タスク）

-- ============================================================
-- projects テーブル
-- ============================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーがある場合は削除（安全のため）
DROP POLICY IF EXISTS "Public can view projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can manage projects" ON projects;
DROP POLICY IF EXISTS "anon_select_projects" ON projects;
DROP POLICY IF EXISTS "authenticated_all_projects" ON projects;

-- anon: SELECT のみ（公開ポートフォリオ表示用）
CREATE POLICY "anon_select_projects" ON projects
  FOR SELECT TO anon USING (true);

-- authenticated: ALL（管理画面操作）
CREATE POLICY "authenticated_all_projects" ON projects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- columns テーブル
-- ============================================================

ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view columns" ON columns;
DROP POLICY IF EXISTS "Authenticated users can manage columns" ON columns;
DROP POLICY IF EXISTS "anon_select_columns" ON columns;
DROP POLICY IF EXISTS "anon_update_columns" ON columns;
DROP POLICY IF EXISTS "authenticated_all_columns" ON columns;

-- anon: SELECT 許可（公開コラム表示）
CREATE POLICY "anon_select_columns" ON columns
  FOR SELECT TO anon USING (true);

-- anon: UPDATE 許可（暫定: view_count インクリメント用・後日 RPC 化予定）
CREATE POLICY "anon_update_columns" ON columns
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- authenticated: ALL（管理画面操作）
CREATE POLICY "authenticated_all_columns" ON columns
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- documents テーブル
-- ============================================================

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active documents" ON documents;
DROP POLICY IF EXISTS "Authenticated users can manage documents" ON documents;
DROP POLICY IF EXISTS "anon_select_documents" ON documents;
DROP POLICY IF EXISTS "anon_update_documents" ON documents;
DROP POLICY IF EXISTS "authenticated_all_documents" ON documents;

-- anon: is_active = true の文書のみ SELECT 許可
CREATE POLICY "anon_select_documents" ON documents
  FOR SELECT TO anon USING (is_active = true);

-- anon: UPDATE 許可（暫定: download_count インクリメント用・後日 RPC 化予定）
CREATE POLICY "anon_update_documents" ON documents
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- authenticated: ALL（管理画面操作）
CREATE POLICY "authenticated_all_documents" ON documents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- document_requests テーブル
-- ============================================================

ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert document requests" ON document_requests;
DROP POLICY IF EXISTS "Authenticated users can view document requests" ON document_requests;
DROP POLICY IF EXISTS "anon_insert_document_requests" ON document_requests;
DROP POLICY IF EXISTS "authenticated_all_document_requests" ON document_requests;

-- anon: INSERT のみ（資料請求フォーム送信）
CREATE POLICY "anon_insert_document_requests" ON document_requests
  FOR INSERT TO anon WITH CHECK (true);

-- authenticated: ALL（管理画面で個人情報を含む請求情報を閲覧・編集）
CREATE POLICY "authenticated_all_document_requests" ON document_requests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- contacts テーブル（既存ポリシー整理含む）
-- ============================================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- 既存ポリシー（重複している・整理対象）を削除
DROP POLICY IF EXISTS "Anonymous users can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can read all contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can update contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can delete contacts" ON contacts;
DROP POLICY IF EXISTS "anon_insert_contacts" ON contacts;
DROP POLICY IF EXISTS "authenticated_all_contacts" ON contacts;

-- anon: INSERT のみ（お問い合わせフォーム・プロンプトリクエスト送信）
CREATE POLICY "anon_insert_contacts" ON contacts
  FOR INSERT TO anon WITH CHECK (true);

-- authenticated: ALL（管理画面で個人情報を含むお問い合わせを閲覧・編集・削除）
CREATE POLICY "authenticated_all_contacts" ON contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
