# 管理画面ログイン情報

## ログイン認証情報

管理画面にアクセスするためのログイン情報：

- **URL**: http://localhost:3000/login (開発環境)
- **本番URL**: https://portfolio-site-blond-eta.vercel.app/login

### オプション1（推奨 - .env.localと一致）
- **メールアドレス**: `tamogami@landbridge.co.jp`
- **パスワード**: `Portfolio2024!`

### オプション2
- **メールアドレス**: `admin@portfolio.com`
- **パスワード**: `Portfolio2024!`

## Supabaseでユーザーを作成する手順

1. Supabaseダッシュボードにログイン
2. 左メニューから「Authentication」→「Users」を選択
3. 「Invite user」または「Create new user」ボタンをクリック
4. 以下の情報を入力（どちらか選択）：
   - オプション1: Email: `tamogami@landbridge.co.jp`, Password: `Portfolio2024!`
   - オプション2: Email: `admin@portfolio.com`, Password: `Portfolio2024!`
5. 「Create user」をクリックして作成完了

## 注意事項

- パスワードは安全な場所に保管してください
- 本番環境では必ず強力なパスワードに変更してください
- 定期的にパスワードを更新することを推奨します

## トラブルシューティング

### ログインできない場合

1. Supabaseでユーザーが作成されているか確認
2. メールアドレスとパスワードが正しいか確認
3. Supabaseの環境変数が正しく設定されているか確認

### パスワードを忘れた場合

Supabaseダッシュボードからパスワードをリセットできます：
1. Authentication → Users
2. 該当ユーザーの「...」メニューから「Send password reset」を選択