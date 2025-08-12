-- コラムテーブルの作成
CREATE TABLE IF NOT EXISTS columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  thumbnail VARCHAR,
  author VARCHAR,
  published_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 資料テーブルの作成
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  thumbnail VARCHAR,
  file_url VARCHAR,
  category VARCHAR,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 資料請求テーブルの作成
CREATE TABLE IF NOT EXISTS document_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  company_name VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  department VARCHAR,
  position VARCHAR,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成（既存の場合はスキップ）
CREATE INDEX IF NOT EXISTS idx_columns_slug ON columns(slug);
CREATE INDEX IF NOT EXISTS idx_columns_published ON columns(is_published, published_date DESC);
CREATE INDEX IF NOT EXISTS idx_documents_active ON documents(is_active);
CREATE INDEX IF NOT EXISTS idx_document_requests_document ON document_requests(document_id);

-- RLSポリシーの設定
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除してから再作成
DROP POLICY IF EXISTS "Public columns are viewable by everyone" ON columns;
CREATE POLICY "Public columns are viewable by everyone" ON columns
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Authenticated users can manage columns" ON columns;
CREATE POLICY "Authenticated users can manage columns" ON columns
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Active documents are viewable by everyone" ON documents;
CREATE POLICY "Active documents are viewable by everyone" ON documents
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage documents" ON documents;
CREATE POLICY "Authenticated users can manage documents" ON documents
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can create document requests" ON document_requests;
CREATE POLICY "Anyone can create document requests" ON document_requests
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view document requests" ON document_requests;
CREATE POLICY "Authenticated users can view document requests" ON document_requests
  FOR SELECT USING (auth.role() = 'authenticated');

-- サンプルデータの挿入（既存データがない場合のみ）
INSERT INTO columns (title, slug, excerpt, content, thumbnail, author, tags, is_published) 
SELECT * FROM (VALUES
(
  'Next.js 15の新機能解説',
  'nextjs-15-new-features',
  'Next.js 15がリリースされ、パフォーマンスの向上と新しいAPIが追加されました。',
  '## Next.js 15の主な変更点\n\nNext.js 15では、以下の新機能が追加されました：\n\n1. **Turbopack**の安定版リリース\n2. **Server Actions**の改善\n3. **Parallel Routes**の強化\n\n### Turbopackによる高速化\n\nTurbopackは、Webpackの後継として開発された新しいバンドラーです...',
  'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=800&h=600',
  'LandBridge開発チーム',
  ARRAY['Next.js', 'React', 'Web開発'],
  true
),
(
  'Supabaseを使った認証システムの構築',
  'supabase-authentication-guide',
  'Supabaseを使用して、安全で使いやすい認証システムを構築する方法を解説します。',
  '## Supabase認証の基本\n\nSupabaseは、PostgreSQLベースのBaaSで、認証機能も提供しています。\n\n### セットアップ手順\n\n1. Supabaseプロジェクトの作成\n2. 認証プロバイダーの設定\n3. クライアントライブラリの導入...',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600',
  'LandBridge開発チーム',
  ARRAY['Supabase', '認証', 'セキュリティ'],
  true
),
(
  'TypeScriptの型安全性を最大限に活用する',
  'typescript-type-safety',
  'TypeScriptの高度な型機能を使って、より安全なコードを書く方法を紹介します。',
  '## TypeScriptの型システム\n\nTypeScriptの型システムは非常に強力で、適切に使用することで多くのバグを防ぐことができます。\n\n### ジェネリクスの活用\n\n```typescript\nfunction safeGet<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\n```',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600',
  'LandBridge開発チーム',
  ARRAY['TypeScript', '型安全性', 'プログラミング'],
  true
)) AS new_columns(title, slug, excerpt, content, thumbnail, author, tags, is_published)
WHERE NOT EXISTS (
  SELECT 1 FROM columns WHERE slug = new_columns.slug
);

-- 既存データがない場合のみ資料を挿入
INSERT INTO documents (title, description, thumbnail, category, tags, file_url) 
SELECT * FROM (VALUES
(
  'Web開発サービス資料',
  '当社のWeb開発サービスの詳細をご紹介する資料です。最新技術を活用した開発手法や、過去の実績について詳しく説明しています。',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600',
  'サービス紹介',
  ARRAY['Web開発', 'サービス', '実績'],
  '/documents/web-development-service.pdf'
),
(
  'モバイルアプリ開発事例集',
  'iOS/Androidアプリの開発事例をまとめた資料です。UI/UXデザインから実装まで、具体的な事例を通じてご紹介します。',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600',
  '事例紹介',
  ARRAY['モバイル開発', 'iOS', 'Android', '事例'],
  '/documents/mobile-app-cases.pdf'
),
(
  'システム開発の進め方ガイド',
  'アジャイル開発手法を用いたプロジェクトの進め方について解説した資料です。効率的な開発プロセスを実現するためのノウハウを公開しています。',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600',
  'ガイド',
  ARRAY['アジャイル', 'プロジェクト管理', '開発プロセス'],
  '/documents/agile-development-guide.pdf'
)) AS new_docs(title, description, thumbnail, category, tags, file_url)
WHERE NOT EXISTS (
  SELECT 1 FROM documents WHERE title = new_docs.title
);