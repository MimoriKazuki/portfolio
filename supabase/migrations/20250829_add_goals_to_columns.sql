-- コラムテーブルに目標フィールドを追加
ALTER TABLE columns
ADD COLUMN IF NOT EXISTS base_goal INTEGER,
ADD COLUMN IF NOT EXISTS stretch_goal INTEGER;

-- コメントを追加
COMMENT ON COLUMN columns.base_goal IS 'ベース目標（中央値ベース）';
COMMENT ON COLUMN columns.stretch_goal IS 'ストレッチ目標（90パーセンタイルベース）';