-- e_learning_usersに購入ステータスフィールドを追加
ALTER TABLE e_learning_users
ADD COLUMN has_paid_access BOOLEAN DEFAULT FALSE;

-- 既存ユーザーは未購入状態
COMMENT ON COLUMN e_learning_users.has_paid_access IS '有料コンテンツへのアクセス権限（購入済みかどうか）';
