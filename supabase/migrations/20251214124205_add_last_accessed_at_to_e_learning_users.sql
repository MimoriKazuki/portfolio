
-- e_learning_usersテーブルにlast_accessed_atカラムを追加
ALTER TABLE e_learning_users
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ DEFAULT NULL;

-- コメントを追加
COMMENT ON COLUMN e_learning_users.last_accessed_at IS 'eラーニングページへの最終アクセス日時';

-- 既存ユーザーの初期値としてcreated_atを設定
UPDATE e_learning_users
SET last_accessed_at = created_at
WHERE last_accessed_at IS NULL;
