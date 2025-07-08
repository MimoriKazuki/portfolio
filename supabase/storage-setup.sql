-- Supabaseストレージバケットの設定
-- Supabaseダッシュボードで実行してください

-- プロジェクトの画像を保存するバケットを作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-thumbnails', 'project-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- バケットのポリシーを設定
-- 誰でも読み取り可能
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING (bucket_id = 'project-thumbnails');

-- 認証されたユーザーのみアップロード可能
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-thumbnails' AND auth.role() = 'authenticated');

-- 認証されたユーザーのみ更新可能
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE
USING (bucket_id = 'project-thumbnails' AND auth.role() = 'authenticated');

-- 認証されたユーザーのみ削除可能
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE
USING (bucket_id = 'project-thumbnails' AND auth.role() = 'authenticated');