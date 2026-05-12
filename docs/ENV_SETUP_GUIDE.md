# 環境変数設定ガイド

## 必須項目

### 1. Supabase設定
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

### 2. 管理者メールアドレス
```env
ADMIN_EMAIL=admin@example.com
```
- 管理画面にログインするメールアドレスを設定

## オプション項目

### 3. Google Analytics（フロントエンド追跡）
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**取得方法：**
1. [Google Analytics](https://analytics.google.com) にアクセス
2. 管理 > プロパティを作成（GA4プロパティ）
3. データストリーム > ウェブ > ストリームを作成
4. 測定ID（G-XXXXXXXXXX形式）をコピー

### 4. Google Analytics Data API（管理画面用）
```env
GOOGLE_ANALYTICS_PROPERTY_ID=123456789
GOOGLE_ANALYTICS_CREDENTIALS='JSONキーの内容'
```

**取得方法：**
1. [Google Cloud Console](https://console.cloud.google.com) でプロジェクトを作成
2. APIとサービス > ライブラリ から「Google Analytics Data API」を有効化
3. APIとサービス > 認証情報 でサービスアカウントを作成
4. サービスアカウントのJSONキーをダウンロード
5. JSONキーの内容を文字列化して `GOOGLE_ANALYTICS_CREDENTIALS` に設定（シングルクォートで囲む）
6. Google Analytics の管理画面でプロパティのアクセス管理にサービスアカウントのメールを追加（閲覧者権限）
7. プロパティIDを `GOOGLE_ANALYTICS_PROPERTY_ID` に設定

### 5. Slack通知
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX
```

**取得方法：**
1. Slack ワークスペースの管理画面へアクセス
2. アプリ > Incoming Webhooks を追加
3. 通知を送信するチャンネルを選択
4. Webhook URLをコピー

### 6. その他
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=development
```

## 設定方法

1. `.env.local.template` をコピーして `.env.local` を作成
   ```bash
   cp .env.local.template .env.local
   ```

2. 各項目の値を実際の値に置き換える

3. アプリケーションを再起動
   ```bash
   npm run dev
   ```

## 注意事項

- `.env.local` ファイルは **絶対に** Gitにコミットしないでください
- `NEXT_PUBLIC_` プレフィックスがついた変数はクライアントサイドで使用可能です
- プレフィックスがない変数はサーバーサイドでのみ使用可能です
- 本番環境では、Vercelなどのホスティングサービスの環境変数設定を使用してください