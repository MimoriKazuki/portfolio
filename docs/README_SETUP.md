# Portfolio Site Setup Guide

このポートフォリオサイトは、Next.js、Tailwind CSS、Supabaseを使用して構築されています。

## 🚀 セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとAPIキーを取得

### 2. データベースのセットアップ

1. Supabaseダッシュボードの「SQL Editor」を開く
2. `supabase/schema.sql`の内容をコピーして実行
3. これにより、必要なテーブルとセキュリティポリシーが作成されます

### 3. 環境変数の設定

1. `.env.local.example`を`.env.local`にコピー
```bash
cp .env.local.example .env.local
```

2. `.env.local`ファイルを編集して、Supabaseの認証情報を入力
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_EMAIL=your_admin_email@example.com
```

### 4. 管理者アカウントの作成

1. Supabaseダッシュボードの「Authentication」→「Users」を開く
2. 「Invite user」をクリック
3. 管理者のメールアドレスを入力して招待を送信
4. メールから登録を完了

### 5. アプリケーションの起動

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

`http://localhost:3000`でサイトにアクセスできます。

## 📝 管理画面の使用方法

1. `/admin/login`にアクセス
2. 登録した管理者アカウントでログイン
3. プロジェクトやプロフィールの管理が可能

## 🚢 Vercelへのデプロイ

1. GitHubにリポジトリをプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

## 🛠️ カスタマイズ

### プロフィール情報の更新
管理画面から、または直接Supabaseダッシュボードで`profiles`テーブルを編集

### プロジェクトの追加
管理画面の「Projects」→「Add Project」から追加可能

### デザインのカスタマイズ
- カラーテーマ: `tailwind.config.ts`の`youtube`カラーを編集
- レイアウト: `app/components/`内のコンポーネントを編集