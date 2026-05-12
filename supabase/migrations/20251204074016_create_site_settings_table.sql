-- サイト設定テーブル
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 更新時のタイムスタンプ自動更新
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();

-- eラーニング公開設定の初期データを挿入
INSERT INTO site_settings (key, value, description)
VALUES (
  'e_learning_released',
  'false'::jsonb,
  'eラーニング機能の公開状態（true: 公開、false: 準備中）'
)
ON CONFLICT (key) DO NOTHING;

-- RLSを有効化
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 読み取りポリシー（全員が読める）
CREATE POLICY "Anyone can read site_settings" ON site_settings
  FOR SELECT USING (true);

-- 更新ポリシー（認証済みユーザーのみ - 管理者用）
CREATE POLICY "Authenticated users can update site_settings" ON site_settings
  FOR UPDATE USING (auth.role() = 'authenticated');
