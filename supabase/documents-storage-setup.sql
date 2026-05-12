-- Supabaseストレージバケットの設定（資料用）
-- Supabaseダッシュボードで実行してください

-- 資料PDFを保存するバケットを作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- バケットのポリシーを設定
-- 誰でも読み取り可能
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- 認証されたユーザーのみアップロード可能
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- 認証されたユーザーのみ更新可能
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- 認証されたユーザーのみ削除可能
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');