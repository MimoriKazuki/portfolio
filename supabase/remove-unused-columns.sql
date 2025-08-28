-- projectsテーブルから不要なカラムを削除するSQL
-- 注意: このスクリプトはSupabaseのSQL Editorで実行してください

-- status と github_url カラムを削除
ALTER TABLE projects 
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS github_url;

-- 削除後のテーブル構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;