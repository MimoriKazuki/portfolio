# 現在の作業状況

## 最終更新: 2025-12-04

## ★ 現在のタスク: ライブモードへの移行 ★

### 完了済み
1. テストモードでの決済実装・動作確認 ✅
2. `.env.local`にライブモードの`STRIPE_SECRET_KEY`と`STRIPE_WEBHOOK_SECRET`を設定済み ✅
3. `.mcp.json`のStripe APIキーをライブモードに更新済み ✅

### 残タスク
1. **ライブモードで商品・価格を作成**
   - 商品名: `eラーニング全コンテンツアクセス`
   - 価格: `4,980円`（1回限りの支払い）
2. **`.env.local`の`STRIPE_E_LEARNING_PRICE_ID`を更新**
   - ライブモードの価格ID（`price_`で始まる）に変更
3. **Vercelの環境変数を更新**
   - `STRIPE_SECRET_KEY` → ライブモードのキー
   - `STRIPE_WEBHOOK_SECRET` → ライブモードのWebhook署名シークレット
   - `STRIPE_E_LEARNING_PRICE_ID` → ライブモードの価格ID
4. **本番デプロイ・動作確認**

---

## Stripe決済実装 - 完了分

### 1. 購入モデル
- 価格: 4,980円（税込・買い切り）
- 1回の購入で全有料コンテンツにアクセス可能

### 2. DBマイグレーション ✅
- `e_learning_users`テーブルに`has_paid_access`フィールドを追加
- 購入完了時にこのフラグを`true`に更新

### 3. 修正ファイル ✅
- `app/lib/stripe/client.ts` - 遅延初期化に変更（ビルドエラー回避）
- `app/api/stripe/checkout/route.ts` - 固定Price ID使用、has_paid_accessチェック
- `app/api/stripe/webhook/route.ts` - has_paid_access更新ロジック
- `app/e-learning/[id]/page.tsx` - has_paid_accessで判定
- `app/e-learning/[id]/ELearningDetailClient.tsx` - 購入モーダル表示
- `app/e-learning/PurchasePromptModal.tsx` - 購入促進モーダル
- `app/e-learning/LoginPromptModal.tsx` - ログイン促進モーダル
- `app/components/AuthButton.tsx` - ログアウト時ローディング表示

### 4. モーダルの仕様 ✅
- 外部クリックで閉じない
- Escapeキーで閉じない
- ボタン操作（ログイン/購入/戻る）でのみ閉じる
- 戻るボタンは`window.history.back()`で元の画面に戻る

## 購入フロー（実装済み）
1. ユーザーが有料コンテンツにアクセス
2. 購入モーダルが表示
3. 「購入する」クリック → `/api/stripe/checkout` を呼び出し
4. Stripe Checkout にリダイレクト
5. 決済完了 → Webhook で `e_learning_users.has_paid_access` を `true` に更新
6. 成功ページにリダイレクト
7. 全有料コンテンツ視聴可能

## 関連テーブル
- `e_learning_users` - ユーザー情報（`has_paid_access`で購入状態管理）
- `e_learning_purchases` - 購入履歴
- `e_learning_contents` - コンテンツ情報（`is_free`で無料/有料判定）

## Supabase Project ID
- mtyogrpeeeggqoxzvyry
