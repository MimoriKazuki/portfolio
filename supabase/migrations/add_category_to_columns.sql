-- Add category column to columns table
-- カテゴリの列挙型を作成
CREATE TYPE column_category AS ENUM ('ai-tools', 'industry', 'topics-news');

-- columnsテーブルにcategoryカラムを追加
ALTER TABLE columns 
ADD COLUMN IF NOT EXISTS category column_category DEFAULT 'topics-news';

-- 既存のレコードのカテゴリをデフォルト値に設定
UPDATE columns 
SET category = 'topics-news' 
WHERE category IS NULL;

-- インデックスを追加してパフォーマンスを向上
CREATE INDEX IF NOT EXISTS idx_columns_category ON columns(category);