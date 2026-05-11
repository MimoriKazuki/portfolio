# Vercel環境変数の設定（Slack Webhook）

## 手順

1. Vercelダッシュボードにログイン
2. プロジェクトを選択
3. 「Settings」タブをクリック
4. 左サイドバーの「Environment Variables」をクリック
5. 以下の環境変数を追加：

### 追加する環境変数

| Key | Value | Environment |
|-----|-------|-------------|
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/services/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` | Production, Preview, Development |

### 設定方法

1. 「Add New」をクリック
2. Key に `SLACK_WEBHOOK_URL` を入力
3. Value に上記のWebhook URLを入力
4. Environment で全ての環境にチェック
5. 「Save」をクリック

### 確認

設定後、デプロイメントが自動的に再実行されます。
コンタクトフォームから送信したメッセージがSlackに通知されることを確認してください。

## セキュリティについて

- Webhook URLは環境変数として管理され、ソースコードには含まれません
- Vercelの環境変数は暗号化されて保存されます
- 本番環境のみに制限したい場合は、Environment設定で「Production」のみを選択してください

## トラブルシューティング

### Slack通知が届かない場合

1. 環境変数が正しく設定されているか確認
2. Vercelのデプロイメントログでエラーがないか確認
3. Slack Webhookが有効であることを確認
4. APIルートのログを確認（Vercel Functions ログ）