-- Portfolio Database Complete Setup
-- This file contains all SQL commands in one place for easy execution

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create enums
CREATE TYPE project_status AS ENUM ('completed', 'in-progress', 'planned');
CREATE TYPE project_category AS ENUM ('homepage', 'landing-page', 'web-app', 'mobile-app');

-- Step 3: Create profiles table
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  avatar TEXT NOT NULL,
  github_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  email TEXT,
  location TEXT
);

-- Step 4: Create projects table
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  live_url TEXT,
  github_url TEXT,
  technologies TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  status project_status DEFAULT 'planned',
  category project_category DEFAULT 'web-app',
  duration TEXT,
  "order" INTEGER DEFAULT 0
);

-- Step 5: Create indexes
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_order ON projects("order");

-- Step 6: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Create triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Step 9: Create policies for public read access
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

-- Step 10: Create policies for authenticated write access
-- Profiles policies
CREATE POLICY "Authenticated users can insert profiles" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update profiles" ON profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete profiles" ON profiles
  FOR DELETE USING (auth.role() = 'authenticated');

-- Projects policies
CREATE POLICY "Authenticated users can insert projects" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update projects" ON projects
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete projects" ON projects
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 11: Insert sample profile data
INSERT INTO profiles (
  name,
  title,
  bio,
  avatar,
  email,
  location
) VALUES (
  'LAND Bridge',
  'システム開発会社',
  '私たちは、お客様のビジネスを成功に導くシステム開発を提供します。ホームページ、ランディングページ、Webアプリケーション、モバイルアプリケーションなど、幅広いプロジェクトに対応しています。',
  'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=400&h=400&fit=crop',
  'tamogami@landbridge.co.jp',
  '東京, 日本'
);

-- Step 12: Insert sample projects
INSERT INTO projects (title, description, thumbnail, category, technologies, featured, status, live_url, duration, "order") VALUES
  (
    'コーポレートサイトリニューアル',
    '大手製造業のコーポレートサイトを全面リニューアル。レスポンシブデザインとCMSを導入し、更新作業の効率化を実現。',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    'homepage',
    ARRAY['Next.js', 'TypeScript', 'Tailwind CSS', 'Contentful'],
    true,
    'completed',
    'https://example.com',
    '3ヶ月',
    1
  ),
  (
    'ECサイト構築',
    'D2Cブランド向けのECサイトを構築。Shopifyをベースに、カスタムテーマとアプリを開発し、ブランドイメージを表現。',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
    'web-app',
    ARRAY['Shopify', 'Liquid', 'JavaScript', 'Node.js'],
    true,
    'completed',
    'https://example-shop.com',
    '2ヶ月',
    2
  ),
  (
    'SaaSダッシュボード開発',
    'BtoBのSaaSプロダクト向けダッシュボードを開発。リアルタイムデータの可視化と分析機能を実装。',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    'web-app',
    ARRAY['React', 'TypeScript', 'Material-UI', 'GraphQL', 'PostgreSQL'],
    true,
    'completed',
    'https://dashboard.example.com',
    '4ヶ月',
    3
  ),
  (
    'モバイルアプリ開発',
    'フィットネストラッキングアプリをReact Nativeで開発。iOS/Android両対応で、ヘルスケアデータとの連携機能も実装。',
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop',
    'mobile-app',
    ARRAY['React Native', 'TypeScript', 'Firebase', 'HealthKit'],
    false,
    'in-progress',
    NULL,
    '3ヶ月（予定）',
    4
  ),
  (
    'ランディングページ制作',
    '新サービスローンチ向けのランディングページを制作。A/Bテストを実施し、コンバージョン率を最適化。',
    'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=800&h=450&fit=crop',
    'landing-page',
    ARRAY['HTML', 'CSS', 'JavaScript', 'Google Analytics'],
    false,
    'completed',
    'https://landing.example.com',
    '2週間',
    5
  );