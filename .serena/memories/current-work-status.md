# 現在の作業状況

## 最終更新: 2025-12-04

## Stripe決済実装 - 完了分

### 1. 購入モデル変更: 個別コンテンツ → 全コンテンツ見放題
- 価格: 4,980円（税込・買い切り）
- 1回の購入で全有料コンテンツにアクセス可能

### 2. DBマイグレーション ✅
- `e_learning_users`テーブルに`has_paid_access`フィールドを追加
- 購入完了時にこのフラグを`true`に更新

### 3. Stripe商品・価格 ✅
- 商品ID: `prod_TXfAGokNxbnkRF`
- 価格ID: `price_1SaZq3Kvr8fxkHMdMUOjFG4W`
- 価格: 4,980円（JPY）

### 4. 修正ファイル ✅
- `app/lib/stripe/client.ts` - 遅延初期化に変更（ビルドエラー回避）
- `app/api/stripe/checkout/route.ts` - 固定Price ID使用、has_paid_accessチェック
- `app/api/stripe/webhook/route.ts` - has_paid_access更新ロジック
- `app/e-learning/[id]/page.tsx` - has_paid_accessで判定
- `app/e-learning/[id]/ELearningDetailClient.tsx` - 購入モーダル表示

### 5. 新規作成ファイル ✅
- `app/e-learning/PurchasePromptModal.tsx` - 購入促進モーダル

## 次のアクション

### Step 1: 環境変数設定
ローカル（`.env.local`）とVercelに以下を設定：
```
STRIPE_SECRET_KEY=sk_test_... (環境変数から取得)
STRIPE_WEBHOOK_SECRET=whsec_... (Step 2で取得)
STRIPE_E_LEARNING_PRICE_ID=price_1SaZq3Kvr8fxkHMdMUOjFG4W (オプション、デフォルト値あり)
SUPABASE_SERVICE_ROLE_KEY=... (既存か確認)
NEXT_PUBLIC_BASE_URL=https://www.landbridge.ai
```

### Step 2: Webhookエンドポイント登録
Stripeダッシュボード > Developers > Webhooks:
1. エンドポイント追加: `https://www.landbridge.ai/api/stripe/webhook`
2. イベント選択: `checkout.session.completed`
3. Webhook Secret（`whsec_...`）を取得して環境変数に設定

### Step 3: テスト
1. テスト用カード番号: `4242 4242 4242 4242`
2. 有効期限: 将来の日付
3. CVC: 任意の3桁

## 購入フロー（実装済み）
1. ユーザーが有料コンテンツにアクセス
2. 購入モーダルが表示（LoginPromptModalと同デザイン）
3. 「購入する」クリック → `/api/stripe/checkout` を呼び出し
4. Stripe Checkout にリダイレクト
5. 決済完了 → Webhook で `e_learning_users.has_paid_access` を `true` に更新
6. 成功ページ（元の詳細ページ `?success=true`）にリダイレクト
7. ページリロードで購入確認 → 全有料コンテンツ視聴可能

## 関連テーブル
- `e_learning_users` - ユーザー情報（`has_paid_access`で購入状態管理）
- `e_learning_purchases` - 購入履歴（`content_id`はnull、全体購入の記録）
- `e_learning_contents` - コンテンツ情報（`is_free`で無料/有料判定）

## Supabase Project ID
- mtyogrpeeeggqoxzvyry
