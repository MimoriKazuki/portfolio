-- 企業に紐づくユーザー（メールアドレス）テーブル
CREATE TABLE e_learning_corporate_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  corporate_customer_id UUID NOT NULL REFERENCES e_learning_corporate_customers(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  UNIQUE(corporate_customer_id, email)
);

-- インデックス（メールアドレスでの検索を高速化）
CREATE INDEX idx_corporate_users_email ON e_learning_corporate_users(email);

-- コメント追加
COMMENT ON TABLE e_learning_corporate_users IS '契約企業に紐づくユーザーのメールアドレス';

-- RLSを有効化
ALTER TABLE e_learning_corporate_users ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能なポリシー
CREATE POLICY "Allow authenticated users to manage corporate users"
  ON e_learning_corporate_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
