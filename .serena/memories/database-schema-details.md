# データベーススキーマ詳細

## Supabase接続情報
- **Project ID**: mtyogrpeeeggqoxzvyry
- **Project Name**: Portfolio Site
- **Region**: ap-southeast-1
- **Database Version**: PostgreSQL 17.4.1.048

## テーブル詳細

### 1. projects (プロジェクト実績)
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  live_url TEXT,
  video_url TEXT,  -- YouTube, Vimeo等の動画URL
  technologies TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  category project_category DEFAULT 'homepage',
  duration TEXT,
  order INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  image_url TEXT,
  prompt TEXT,  -- プロジェクト作成時のプロンプト内容
  prompt_filename TEXT,  -- プロンプトファイル名
  enterprise_service TEXT DEFAULT 'comprehensive-ai-training',
  individual_service TEXT DEFAULT 'individual-coaching'
);

-- project_category enum
-- 'homepage', 'landing-page', 'web-app', 'mobile-app', 'video'
```

**RLS**: 無効（公開読み取り）
**レコード数**: 35件
**用途**: ポートフォリオの制作実績を保存

### 2. columns (コラム記事)
```sql
CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE,  -- 非推奨: 現在は使用していない
  excerpt TEXT,
  content TEXT NOT NULL,  -- HTML形式のリッチテキスト
  thumbnail VARCHAR,
  author VARCHAR,
  published_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  seo_title TEXT,
  seo_description TEXT,
  publish_date TIMESTAMPTZ DEFAULT timezone('utc', now()),
  is_featured BOOLEAN DEFAULT false,
  category column_category DEFAULT 'topics-news',
  audio_url VARCHAR,  -- .m4a音声ファイルのURL
  base_goal INTEGER,  -- ビュー目標（中央値ベース）
  stretch_goal INTEGER,  -- ストレッチ目標（90パーセンタイル）
  enterprise_service TEXT DEFAULT 'comprehensive-ai-training',
  individual_service TEXT DEFAULT 'individual-coaching'
);

-- column_category enum
-- 'ai-tools', 'industry', 'topics-news'
```

**RLS**: 無効（公開読み取り）
**レコード数**: 112件
**用途**: AIに関するコラム記事の保存

### 3. documents (資料・ドキュメント)
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  thumbnail VARCHAR,
  file_url VARCHAR,  -- PDF等のファイルURL
  category VARCHAR,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  is_featured BOOLEAN DEFAULT false
);
```

**RLS**: 無効（公開読み取り）
**レコード数**: 4件
**用途**: ダウンロード可能な資料の管理

### 4. notices (お知らせ)
```sql
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  category VARCHAR NOT NULL CHECK (category IN ('news', 'webinar', 'maintenance', 'event', 'other')),
  site_url VARCHAR,  -- 外部リンク
  thumbnail VARCHAR,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**RLS**: 有効
**レコード数**: 6件
**用途**: 企業からのお知らせ・ニュース管理

### 5. contacts (お問い合わせ)
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  inquiry_type TEXT DEFAULT 'other' CHECK (inquiry_type IN ('service', 'partnership', 'recruit', 'other')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
  type TEXT,
  metadata JSONB
);
```

**RLS**: 無効
**レコード数**: 27件
**用途**: お問い合わせフォームからの投稿を保存
**Slack連携**: 新規お問い合わせをSlackに通知

### 6. document_requests (資料請求)
```sql
CREATE TABLE document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  company_name VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  department VARCHAR,
  position VARCHAR,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**RLS**: 無効
**レコード数**: 3件
**用途**: 資料ダウンロード時のリード情報収集

### 7. content_goals (コンテンツ目標設定)
```sql
CREATE TABLE content_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope VARCHAR NOT NULL,  -- 'column_all' または 'article:<pagePath>'
  base_goal INTEGER NOT NULL,  -- 中央値（50パーセンタイル）
  stretch_goal INTEGER NOT NULL,  -- 90パーセンタイル
  mean INTEGER NOT NULL,
  median INTEGER NOT NULL,
  p90 INTEGER NOT NULL,
  max INTEGER NOT NULL,
  sample_count INTEGER NOT NULL,
  range_days INTEGER NOT NULL,  -- 集計期間（日数）
  filter_regex TEXT NOT NULL,
  exclude_bot_traffic BOOLEAN DEFAULT true,
  outlier_filter BOOLEAN DEFAULT true,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS**: 有効
**レコード数**: 9件
**用途**: GA4データから自動計算されたコラム記事のビュー目標
**計算ロジック**:
- 過去30日間のGA4データを分析
- ボットトラフィック除外
- 99パーセンタイル以上を外れ値として除外
- 中央値をbase_goal、90パーセンタイルをstretch_goalとして設定

### 8. profiles (ユーザープロフィール)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
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
```

**RLS**: 有効
**レコード数**: 0件
**用途**: プロフィール情報（現在未使用）

### 9. blog_posts, blog_categories, blog_tags
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID,
  author_name TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  canonical_url TEXT,
  reading_time INTEGER,
  view_count INTEGER DEFAULT 0
);
```

**RLS**: 有効
**レコード数**: 1件
**用途**: ブログ機能（現在は主にcolumnsテーブルを使用）

## Storageバケット

### 1. project-videos
- **用途**: プロジェクト詳細ページの動画ファイル
- **ポリシー**: 公開読み取り可能
- **ファイル形式**: MP4, MOV等

### 2. notice-thumbnails
- **用途**: お知らせのサムネイル画像
- **ポリシー**: 公開読み取り可能
- **ファイル形式**: PNG, JPG, WebP

### 3. column-audio
- **用途**: コラム記事の音声ファイル
- **ポリシー**: 公開読み取り可能
- **ファイル形式**: .m4a

## マイグレーション履歴

主要なマイグレーション：
1. `create_contacts_table.sql` - お問い合わせテーブル作成
2. `create_project_videos_bucket.sql` - 動画バケット作成
3. `add_video_url_to_projects.sql` - プロジェクトに動画URL追加
4. `add_prompt_field.sql` - プロンプトフィールド追加
5. `20250828_create_notices_table.sql` - お知らせテーブル作成
6. `20250828_add_audio_url_to_columns.sql` - コラムに音声URL追加
7. `20250829_create_content_goals_table.sql` - コンテンツ目標テーブル作成
8. `20250829_add_goals_to_columns.sql` - コラムに目標フィールド追加
9. `add_category_to_columns.sql` - コラムにカテゴリ追加

## RLSポリシー概要

### 公開読み取り（RLS無効）
- projects
- columns
- documents
- contacts
- document_requests

### 認証済みユーザーのみ（RLS有効）
- profiles
- blog_posts, blog_categories, blog_tags
- notices
- content_goals

### Storageポリシー
すべてのバケットで：
- 読み取り: 公開
- 書き込み/更新/削除: 認証済みユーザーのみ
