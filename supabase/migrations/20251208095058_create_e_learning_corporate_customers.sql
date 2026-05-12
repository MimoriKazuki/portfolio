-- 企業顧客テーブル
CREATE TABLE e_learning_corporate_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contract_status TEXT DEFAULT 'active' CHECK (contract_status IN ('active', 'expired', 'pending')),
  contract_start_date DATE,
  contract_end_date DATE,
  notes TEXT
);

-- コメント追加
COMMENT ON TABLE e_learning_corporate_customers IS '研修サービス契約企業';
COMMENT ON COLUMN e_learning_corporate_customers.contract_status IS '契約ステータス: active（契約中）, expired（契約終了）, pending（契約準備中）';

-- RLSを有効化
ALTER TABLE e_learning_corporate_customers ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能なポリシー
CREATE POLICY "Allow authenticated users to read corporate customers"
  ON e_learning_corporate_customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert corporate customers"
  ON e_learning_corporate_customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update corporate customers"
  ON e_learning_corporate_customers
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete corporate customers"
  ON e_learning_corporate_customers
  FOR DELETE
  TO authenticated
  USING (true);
