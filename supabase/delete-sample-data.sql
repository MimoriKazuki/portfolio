-- サンプルデータを削除するSQL
-- 注意: このスクリプトはSupabaseのSQL Editorで実行してください

-- projectsテーブルのデータをすべて削除
DELETE FROM projects;

-- profilesテーブルのデータをすべて削除
DELETE FROM profiles;

-- シーケンスをリセット（必要に応じて）
-- ALTER SEQUENCE projects_order_seq RESTART WITH 1;

-- 削除後の確認
SELECT 'Projects count:', COUNT(*) FROM projects;
SELECT 'Profiles count:', COUNT(*) FROM profiles;