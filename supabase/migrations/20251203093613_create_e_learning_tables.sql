-- eラーニングカテゴリ（将来用）
CREATE TABLE e_learning_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- eラーニングコンテンツ
CREATE TABLE e_learning_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  duration TEXT,
  category_id UUID REFERENCES e_learning_categories(id),
  is_free BOOLEAN DEFAULT false,
  price INTEGER DEFAULT 0,
  stripe_price_id TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0
);

-- eラーニング資料（PDF）
CREATE TABLE e_learning_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  content_id UUID REFERENCES e_learning_contents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  display_order INTEGER DEFAULT 0
);

-- 一般ユーザー（管理者と分離）
CREATE TABLE e_learning_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  auth_user_id UUID UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 購入履歴（Stripe連携用）
CREATE TABLE e_learning_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  user_id UUID REFERENCES e_learning_users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES e_learning_contents(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'completed',
  UNIQUE(user_id, content_id)
);

-- RLSを有効化
ALTER TABLE e_learning_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE e_learning_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE e_learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE e_learning_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE e_learning_purchases ENABLE ROW LEVEL SECURITY;

-- 公開コンテンツは誰でも閲覧可能
CREATE POLICY "Allow public read access to categories"
  ON e_learning_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow public read access to published contents"
  ON e_learning_contents FOR SELECT
  USING (is_published = true);

CREATE POLICY "Allow public read access to materials"
  ON e_learning_materials FOR SELECT
  USING (true);

-- ユーザーは自分のデータのみ参照可能
CREATE POLICY "Users can view own profile"
  ON e_learning_users FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile"
  ON e_learning_users FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- 購入履歴は自分のもののみ参照可能
CREATE POLICY "Users can view own purchases"
  ON e_learning_purchases FOR SELECT
  USING (user_id IN (SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid()));

-- 認証済みユーザーは全てのコンテンツを管理可能（管理者用）
CREATE POLICY "Authenticated users can manage categories"
  ON e_learning_categories FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage contents"
  ON e_learning_contents FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage materials"
  ON e_learning_materials FOR ALL
  USING (auth.role() = 'authenticated');

-- コメント追加
COMMENT ON TABLE e_learning_categories IS 'eラーニングのカテゴリマスタ';
COMMENT ON TABLE e_learning_contents IS 'eラーニングのコンテンツ（動画）';
COMMENT ON TABLE e_learning_materials IS 'eラーニングの資料（PDF）';
COMMENT ON TABLE e_learning_users IS 'eラーニングの一般ユーザー（管理者と分離）';
COMMENT ON TABLE e_learning_purchases IS 'eラーニングの購入履歴（Stripe連携用）';
