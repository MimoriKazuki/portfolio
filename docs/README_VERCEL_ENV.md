# Vercel環境変数設定ガイド

管理画面を本番環境で有効にするには、Vercelで以下の環境変数を設定する必要があります。

✅ **設定完了済み** - SUPABASE_SERVICE_ROLE_KEYの誤りを修正し、全ての環境変数が正しく設定されました。

## 必要な環境変数

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Supabaseプロジェクトの公開URL
   - 例: `https://xxxxxxxxxxxxx.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Supabaseの匿名キー（公開キー）
   - Supabaseダッシュボードの Settings > API から取得

3. **SUPABASE_SERVICE_ROLE_KEY**（オプション）
   - サービスロールキー（管理者権限用）
   - より高度な操作が必要な場合のみ

## 設定手順

1. Vercelダッシュボードにログイン
2. プロジェクトを選択
3. Settings タブをクリック
4. Environment Variables セクションに移動
5. 各環境変数を追加：
   - Key: 環境変数名（例: NEXT_PUBLIC_SUPABASE_URL）
   - Value: 対応する値
   - Environment: Production, Preview, Development すべてにチェック
6. Save ボタンをクリック

## 重要な注意事項

- 環境変数を追加後、新しいデプロイが必要です
- 環境変数が正しく設定されないと、管理画面へのアクセスができません
- Supabaseの認証情報は `.env.local` ファイルと同じものを使用してください

## 確認方法

環境変数設定後、以下を確認してください：

1. Vercelで再デプロイをトリガー（GitHubへのプッシュまたは手動デプロイ）
2. https://portfolio-site-blond-eta.vercel.app/admin/login にアクセス
3. 管理者アカウントでログイン：
   - Email: admin@portfolio.com
   - Password: Portfolio2024!