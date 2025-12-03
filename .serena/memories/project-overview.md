# プロジェクト概要

## プロジェクト基本情報
- **プロジェクト名**: AI駆動研究所 ポートフォリオサイト
- **旧名称**: LandBridge株式会社ポートフォリオサイト（リブランディング済み）
- **URL**: https://www.landbridge.ai
- **組織**: AI駆動研究所（旧：LandBridge株式会社）

## 技術スタック
- **フレームワーク**: Next.js 15.3.5 (App Router)
- **言語**: TypeScript 5.5.3
- **スタイリング**: Tailwind CSS 3.4.11
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **デプロイ**: Vercel
- **アニメーション**: GSAP 3.13.0, Three.js 0.170.0
- **リッチテキストエディタ**: TipTap 3.2.0
- **アナリティクス**: Google Analytics 4, Microsoft Clarity

## プロジェクト構造

### ディレクトリ構成
```
/app
  ├── /admin              # 管理画面
  │   ├── /projects       # プロジェクト管理
  │   ├── /contacts       # お問い合わせ管理
  │   ├── /notices        # お知らせ管理
  │   ├── /documents      # ドキュメント管理
  │   ├── /columns        # コラム管理
  │   ├── /e-learning     # eラーニング管理
  │   └── /analytics      # アナリティクス
  ├── /api                # APIルート
  │   ├── /contact        # お問い合わせAPI
  │   ├── /projects       # プロジェクトAPI
  │   ├── /notices        # お知らせAPI
  │   ├── /columns        # コラムAPI
  │   ├── /document-request # 資料請求API
  │   ├── /prompt-request # プロンプト請求API
  │   └── /analytics      # アナリティクスAPI
  ├── /projects           # プロジェクト一覧・詳細
  ├── /columns            # コラム一覧・詳細
  ├── /documents          # ドキュメント一覧・詳細
  ├── /notices            # お知らせ一覧・詳細
  ├── /services           # サービスページ
  │   ├── /comprehensive-ai-training  # 生成AI総合研修
  │   ├── /ai-writing-training        # AIライティング研修
  │   ├── /ai-video-training          # AI動画生成研修
  │   ├── /ai-coding-training         # AIコーディング研修
  │   ├── /practical-ai-training      # 生成AI実務活用研修
  │   └── /ai-talent-development      # AI人材育成所
  ├── /e-learning         # eラーニング一覧・詳細
  ├── /auth               # 認証（Googleログイン）
  ├── /contact            # お問い合わせ
  ├── /login              # 管理者ログイン
  ├── /components         # 共通コンポーネント
  └── /lib                # ユーティリティ
      ├── /supabase       # Supabaseクライアント
      ├── /services       # サービスデータ
      ├── /types          # 型定義
      └── /constants      # 定数

/supabase
  ├── /migrations         # マイグレーションファイル
  ├── schema.sql          # スキーマ定義
  └── *.sql              # セットアップスクリプト

/public                   # 静的ファイル
/scripts                  # セットアップスクリプト
```

### 主要コンポーネント
- `MainLayout`: メインレイアウト（ヘッダー、サイドバー、フッター）
- `Header`: グローバルヘッダー
- `Sidebar`: 左サイドバー（ナビゲーション）
- `RightSidebar`: 右サイドバー（動的コンテンツ）
- `HomeContent`: ホームページコンテンツ
- `ProjectCard`: プロジェクトカード
- `AITrainingLP`: AI研修ランディングページ
- `ServiceTrainingLP`: サービス研修ランディングページ

## Supabaseデータベース構造

### プロジェクトID
- **Project ID**: mtyogrpeeeggqoxzvyry
- **Region**: ap-southeast-1
- **Status**: ACTIVE_HEALTHY

### 主要テーブル

#### 1. projects (プロジェクト)
- **RLS**: 無効
- **レコード数**: 35件
- **主要フィールド**:
  - id, title, description, thumbnail
  - live_url, video_url, github_url
  - technologies (配列), featured (boolean)
  - category (enum: homepage, landing-page, web-app, mobile-app, video)
  - prompt, prompt_filename
  - enterprise_service, individual_service
  - order, display_order, duration

#### 2. columns (コラム)
- **RLS**: 無効
- **レコード数**: 112件
- **主要フィールド**:
  - id, title, slug (deprecated), excerpt, content
  - thumbnail, author, published_date
  - tags (配列), is_published, is_featured
  - category (enum: ai-tools, industry, topics-news)
  - audio_url, view_count
  - base_goal, stretch_goal (目標設定)
  - enterprise_service, individual_service
  - seo_title, seo_description

#### 3. documents (ドキュメント)
- **RLS**: 無効
- **レコード数**: 4件
- **主要フィールド**:
  - id, title, description, thumbnail
  - file_url, category, tags
  - is_active, is_featured
  - download_count

#### 4. notices (お知らせ)
- **RLS**: 有効
- **レコード数**: 6件
- **主要フィールド**:
  - id, title, category
  - site_url, thumbnail, description
  - is_featured, is_published
  - published_date

#### 5. contacts (お問い合わせ)
- **RLS**: 無効
- **レコード数**: 27件
- **主要フィールド**:
  - id, name, company, email, message
  - inquiry_type (enum: service, partnership, recruit, other)
  - status (enum: new, in_progress, completed)
  - type, metadata (jsonb)

#### 6. document_requests (資料請求)
- **RLS**: 無効
- **レコード数**: 3件
- **主要フィールド**:
  - id, document_id (FK)
  - company_name, name, email, phone
  - department, position, message

#### 7. profiles (プロフィール)
- **RLS**: 有効
- **レコード数**: 0件
- **主要フィールド**:
  - id, name, title, bio, avatar
  - github_url, twitter_url, linkedin_url
  - email, location

#### 8. content_goals (コンテンツ目標)
- **RLS**: 有効
- **レコード数**: 9件
- **目的**: GA4データからコラムのビュー目標を自動計算
- **主要フィールド**:
  - scope (column_all または article:<pagePath>)
  - base_goal (中央値), stretch_goal (90パーセンタイル)
  - mean, median, p90, max, sample_count
  - range_days, filter_regex
  - exclude_bot_traffic, outlier_filter

#### 9. blog_posts, blog_categories, blog_tags
- **RLS**: 有効
- **レコード数**: 1件 (posts)
- **用途**: ブログ機能（現在は主にcolumnsを使用）

#### 10. e_learning_categories (eラーニングカテゴリ)
- **RLS**: 有効
- **用途**: eラーニングのカテゴリマスタ
- **主要フィールド**:
  - id, name, slug, description
  - display_order, is_active

#### 11. e_learning_contents (eラーニングコンテンツ)
- **RLS**: 有効
- **用途**: eラーニング動画コンテンツ
- **主要フィールド**:
  - id, title, description, thumbnail_url, video_url
  - duration, category_id (FK)
  - is_free, price, stripe_price_id
  - display_order, is_published, is_featured, view_count

#### 12. e_learning_materials (eラーニング資料)
- **RLS**: 有効
- **用途**: eラーニングの添付資料（PDF等）
- **主要フィールド**:
  - id, content_id (FK), title, file_url, file_size, display_order

#### 13. e_learning_users (eラーニングユーザー)
- **RLS**: 有効
- **用途**: eラーニング用の一般ユーザー（管理者と分離）
- **主要フィールド**:
  - id, auth_user_id, email, display_name, avatar_url, is_active

#### 14. e_learning_purchases (eラーニング購入履歴)
- **RLS**: 有効
- **用途**: Stripe連携用の購入履歴
- **主要フィールド**:
  - id, user_id (FK), content_id (FK)
  - stripe_session_id, amount, status

### Storageバケット
1. **project-videos**: プロジェクトの動画ファイル
2. **notice-thumbnails**: お知らせのサムネイル画像
3. **column-audio**: コラムの音声ファイル (.m4a)
4. **e-learning-thumbnails**: eラーニングコンテンツのサムネイル画像
5. **e-learning-materials**: eラーニングの資料ファイル（PDF等）

## 主要機能

### 1. フロントエンド機能
- **ホームページ**: AI研修サービス紹介
- **プロジェクト一覧**: 制作実績の表示（カテゴリフィルタ付き）
- **プロジェクト詳細**: 動画埋め込み、プロンプト請求機能
- **コラム一覧**: AI関連記事の一覧（カテゴリ別表示）
- **コラム詳細**: リッチテキスト表示、音声再生、目次生成、GA4目標表示
- **ドキュメント一覧**: 資料のダウンロード
- **資料請求フォーム**: 資料請求時の情報入力
- **お知らせ一覧**: 最新情報の表示
- **サービスページ**: 6種類のAI研修サービスLP
- **お問い合わせフォーム**: Slack通知連携
- **eラーニング**: バイブコーディング学習動画（Googleログイン認証）

### 2. 管理画面機能 (/admin)
- **認証**: Supabase Auth（メール/パスワード）
- **プロジェクト管理**: CRUD操作、動画・プロンプトファイルアップロード
- **コラム管理**: TipTapエディタ（リッチテキスト）、音声ファイルアップロード
- **ドキュメント管理**: ファイルアップロード、ダウンロード数追跡
- **お知らせ管理**: CRUD操作、サムネイル画理
- **お問い合わせ管理**: ステータス更新、詳細表示
- **アナリティクス**: 
  - Google Analytics Dashboard（ユーザー活動トレンド）
  - コラム目標管理（GA4連携、目標自動計算）

### 3. API機能
- **GET /api/projects**: プロジェクト一覧取得
- **POST /api/contact**: お問い合わせ送信（Slack通知）
- **POST /api/document-request**: 資料請求
- **POST /api/prompt-request**: プロンプト請求
- **GET /api/notices**: お知らせ一覧
- **GET /api/columns**: コラム一覧
- **GET /api/analytics/user-activity**: ユーザー活動データ
- **GET /api/analytics/column/goals**: コラム目標データ
- **POST /api/analytics/column/recompute**: 目標再計算

### 4. Google Analytics 4 連携
- **GA4 Property ID**: 438842851
- **主要機能**:
  - ページビュー追跡
  - イベント追跡
  - コラム記事のビュー目標自動計算
  - content_goalsテーブルへの自動保存
- **目標計算ロジック**:
  - 過去30日間のデータを分析
  - ボットトラフィック除外
  - 外れ値フィルタリング（99パーセンタイル以上除外）
  - base_goal: 中央値（50パーセンタイル）
  - stretch_goal: 90パーセンタイル

### 5. サービスデータ構造
すべてのサービスページは共通のServiceData型を使用：
- `pageTitle`: ページタイトル
- `heroTitle`, `heroImage`: ヒーローセクション
- `heroCTA`: CTAボタン（問い合わせ、資料DL）
- `serviceOverview`: サービス概要（3項目）
- `midCTA`: 中間CTA
- `curriculum`: カリキュラム（複数項目）
- `benefits`: 研修のメリット（複数項目）
- `targetAudiences`: 対象者（複数項目）
- `trainingFormats`: 研修形式
- `flowSteps`: 導入フロー
- `faq`: よくある質問
- `pricing`: 料金プラン
- `finalCTA`: 最終CTA
- `otherTrainingPrograms`: 他の研修プログラム

### 6. サービスセレクター機能
プロジェクトとコラムに紐付けられたサービス：
- **enterprise_service**: 法人向けサービス（デフォルト: comprehensive-ai-training）
- **individual_service**: 個人向けサービス（デフォルト: individual-coaching）
- プロジェクト/コラム詳細ページで関連サービスを右サイドバーに表示

## ミドルウェア
- **middleware.ts**: 
  - Supabase認証セッション更新
  - プロジェクト/コラム/ドキュメント詳細ページのキャッシュ無効化

## 環境変数
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SLACK_WEBHOOK_URL
NEXT_PUBLIC_GA_MEASUREMENT_ID
GOOGLE_APPLICATION_CREDENTIALS
```

## デプロイ
- **プラットフォーム**: Vercel
- **ブランチ**: main
- **ビルドコマンド**: `npm run build`
- **出力ディレクトリ**: `.next`

## 開発コマンド
```bash
npm run dev          # 開発サーバー起動
npm run build        # ビルド
npm run start        # 本番サーバー起動
npm run setup:admin  # 管理者ユーザー作成
```

## 重要な注意点
1. **RLS (Row Level Security)**:
   - projectsとcolumnsはRLS無効（パブリック）
   - profiles, blog_posts, notices, content_goalsはRLS有効
   
2. **Storageポリシー**:
   - すべてのStorageバケットは公開読み取り可能
   - 書き込みは認証ユーザーのみ

3. **Slug vs ID**:
   - columnsテーブルのslugは廃止予定（非推奨）
   - 現在はIDベースのルーティングを使用

4. **キャッシュ制御**:
   - 詳細ページは動的データのためキャッシュ無効化
   - revalidateを使用して定期的な再検証を実施

5. **SEO最適化**:
   - 各ページに動的メタデータ設定
   - 構造化データ（JSON-LD）実装
   - OGP画像の動的生成（opengraph-image.tsx）

6. **アクセシビリティ**:
   - セマンティックHTML使用
   - ARIA属性適切に設定
   - キーボードナビゲーション対応
