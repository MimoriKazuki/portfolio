# プロジェクト セットアップガイド

このポートフォリオサイトは、Next.js、Tailwind CSS、Supabaseを使用して構築されています。

## 目次

1. [クイックスタート](#クイックスタート)
2. [環境変数の設定](#環境変数の設定)
3. [Supabaseセットアップ](#supabaseセットアップ)
4. [GitHub Secrets設定](#github-secrets設定)
5. [Vercelデプロイ](#vercelデプロイ)

---

## クイックスタート

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd portfolio

# 2. 依存関係のインストール
npm install

# 3. 環境変数の設定
cp .env.local.template .env.local
# .env.localを編集して実際の値を設定

# 4. 開発サーバーの起動
npm run dev
```

`http://localhost:3000` でサイトにアクセスできます。

---

## 環境変数の設定

### 必須項目

#### 1. Supabase設定
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**取得方法：**
1. [Supabase](https://supabase.com) にアクセス
2. プロジェクトの Settings > API ページへ移動
3. 以下の値をコピー：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role secret → `SUPABASE_SERVICE_ROLE_KEY`

#### 2. 管理者メールアドレス
```env
ADMIN_EMAIL=admin@example.com
```

### オプション項目

#### 3. Google Analytics（フロントエンド追跡）
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**取得方法：**
1. [Google Analytics](https://analytics.google.com) にアクセス
2. 管理 > プロパティを作成（GA4プロパティ）
3. データストリーム > ウェブ > ストリームを作成
4. 測定ID（G-XXXXXXXXXX形式）をコピー

#### 4. Google Analytics Data API（管理画面用）
```env
GOOGLE_ANALYTICS_PROPERTY_ID=123456789
GOOGLE_ANALYTICS_CREDENTIALS='JSONキーの内容'
```

**取得方法：**
1. [Google Cloud Console](https://console.cloud.google.com) でプロジェクトを作成
2. APIとサービス > ライブラリ から「Google Analytics Data API」を有効化
3. APIとサービス > 認証情報 でサービスアカウントを作成
4. サービスアカウントのJSONキーをダウンロード
5. JSONキーの内容を文字列化して設定（シングルクォートで囲む）
6. Google Analytics の管理画面でプロパティのアクセス管理にサービスアカウントのメールを追加（閲覧者権限）

#### 5. Slack通知
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX
```

**取得方法：**
1. Slack ワークスペースの管理画面へアクセス
2. アプリ > Incoming Webhooks を追加
3. 通知を送信するチャンネルを選択
4. Webhook URLをコピー

#### 6. その他
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=development
```

### 注意事項

- `.env.local` ファイルは **絶対に** Gitにコミットしないでください
- `NEXT_PUBLIC_` プレフィックスがついた変数はクライアントサイドで使用可能です
- プレフィックスがない変数はサーバーサイドでのみ使用可能です

---

## Supabaseセットアップ

### 1. プロジェクトの作成

1. [Supabase](https://supabase.com) にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとAPIキーを取得

### 2. データベースのセットアップ

1. Supabaseダッシュボードの「SQL Editor」を開く
2. `supabase/schema.sql` の内容をコピーして実行
3. 必要なテーブルとセキュリティポリシーが作成されます

### 3. 管理者アカウントの作成

1. Supabaseダッシュボードの「Authentication」→「Users」を開く
2. 「Invite user」をクリック
3. 管理者のメールアドレスを入力して招待を送信
4. メールから登録を完了

---

## GitHub Secrets設定

### Vercelデプロイの場合

GitHubリポジトリの Settings → Secrets and variables → Actions から以下を追加：

| Secret名 | 取得方法 |
|----------|----------|
| `VERCEL_TOKEN` | Vercelダッシュボード → Account Settings → Tokens |
| `VERCEL_ORG_ID` | Vercelダッシュボード → Team Settings |
| `VERCEL_PROJECT_ID` | Vercelダッシュボード → Project Settings |

### 環境変数も追加

| Secret名 | 説明 |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key |
| `ADMIN_EMAIL` | 管理者メールアドレス |

### SSHデプロイの場合（独自サーバー）

| Secret名 | 説明 |
|----------|------|
| `DEPLOY_HOST` | デプロイ先サーバーのホスト名/IP |
| `DEPLOY_USER` | SSHユーザー名 |
| `DEPLOY_KEY` | SSH秘密鍵（改行を含む全文） |
| `DEPLOY_PORT` | SSHポート番号（通常22） |
| `DEPLOY_PATH` | サーバー上のアプリケーションパス |

---

## Vercelデプロイ

### 手順

1. GitHubにリポジトリをプッシュ
2. [Vercel](https://vercel.com) でプロジェクトをインポート
3. 環境変数を設定（Settings → Environment Variables）
4. デプロイ

### 環境変数の設定

Vercelダッシュボードで以下を設定：

| Key | Environment |
|-----|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Development |
| `ADMIN_EMAIL` | Production, Preview, Development |
| `SLACK_WEBHOOK_URL` | Production |
| `NEXT_PUBLIC_GA_ID` | Production |

### 確認事項

- 環境変数を追加後、新しいデプロイが必要です
- 環境変数が正しく設定されないと、管理画面へのアクセスができません

---

## 管理画面

### アクセス方法

1. `/login` にアクセス
2. Supabaseで作成した管理者アカウントでログイン
3. プロジェクトやコンテンツの管理が可能

### 機能

- プロジェクト管理
- コラム管理
- お知らせ管理
- YouTube動画管理
- eラーニングコンテンツ管理
- 問い合わせ確認

---

## トラブルシューティング

### ログインできない場合

1. Supabaseでユーザーが作成されているか確認
2. 環境変数が正しく設定されているか確認
3. ブラウザのコンソールでエラーメッセージを確認

### 画像アップロードでエラーが発生する場合

1. Supabaseダッシュボードでストレージバケットが作成されているか確認
2. 環境変数が正しく設定されているか確認

### Slack通知が届かない場合

1. 環境変数が正しく設定されているか確認
2. Vercelのデプロイメントログでエラーがないか確認
3. Slack Webhookが有効であることを確認

---

*最終更新: 2025年12月*
