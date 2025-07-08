# GitHub Secrets設定ガイド

## 必要なシークレット

### Vercelデプロイの場合

GitHubリポジトリの設定 → Secrets and variables → Actions から以下を追加：

1. **VERCEL_TOKEN**
   - Vercelダッシュボード → Account Settings → Tokens
   - 新しいトークンを作成してコピー

2. **VERCEL_ORG_ID**
   - Vercelダッシュボード → Team Settings
   - Organization IDをコピー

3. **VERCEL_PROJECT_ID**
   - Vercelダッシュボード → Project Settings
   - Project IDをコピー

4. **環境変数**
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key
   - `ADMIN_EMAIL`: 管理者メールアドレス

### SSHデプロイの場合

1. **DEPLOY_HOST**
   - デプロイ先サーバーのホスト名またはIPアドレス

2. **DEPLOY_USER**
   - SSHユーザー名

3. **DEPLOY_KEY**
   - SSH秘密鍵（改行を含む全文）

4. **DEPLOY_PORT**
   - SSHポート番号（通常は22）

5. **DEPLOY_PATH**
   - サーバー上のアプリケーションパス

## 設定手順

1. GitHubリポジトリページを開く
2. Settings → Secrets and variables → Actions
3. "New repository secret"をクリック
4. 各シークレットの名前と値を入力
5. "Add secret"をクリック

## デプロイ方法の選択

- **Vercel推奨**: `.github/workflows/deploy-vercel.yml`を使用
- **独自サーバー**: `.github/workflows/deploy.yml`を使用

不要な方のファイルは削除してください。