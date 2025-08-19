# ポートフォリオサイト

LandBridge株式会社のポートフォリオサイトです。

## 技術スタック

- **フレームワーク**: Next.js 15.3.5 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase
- **認証**: Supabase Auth

## セットアップ

### 1. 環境変数の設定

`.env.local.example` を `.env.local` にコピーして、Supabaseの認証情報を設定してください。

```bash
cp .env.local.example .env.local
```

### 2. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. `Settings > API` から以下の情報を取得:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. データベースのセットアップ

`supabase/schema.sql` をSupabaseのSQL Editorで実行してテーブルを作成してください。

### 4. 管理者ユーザーの作成

1. 開発サーバーを起動: `npm run dev`
2. `/login/setup` にアクセス
3. 管理者ユーザーを作成

## 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番サーバーの起動
npm run start
```

## 管理画面

管理画面は `/admin` からアクセスできます。以下の機能があります:

- **プロジェクト管理**: ポートフォリオの追加・編集・削除
- **コラム管理**: ブログ記事の作成・編集・公開
- **ドキュメント管理**: 資料のアップロード・管理
- **プロフィール管理**: 会社情報の編集

## トラブルシューティング

### ログインできない場合

1. 環境変数が正しく設定されているか確認
2. Supabaseプロジェクトが正しく設定されているか確認
3. `/login/setup` から新しいユーザーを作成
4. メール確認が必要な場合は、Supabaseのダッシュボードで確認

### データベースエラー

1. Supabaseのテーブルが正しく作成されているか確認
2. RLS (Row Level Security) ポリシーが適切に設定されているか確認