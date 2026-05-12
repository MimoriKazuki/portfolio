# PurchaseRepository

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄）

## 概要

`e_learning_purchases` テーブルの read / write を集約。Stripe Webhook からの書き込みが主な write 経路。

## 使用場面・責務

- 自分の購入履歴取得（API：GET /api/me/purchases）
- アクセス権判定（services 経由）
- Stripe Webhook 受信時の INSERT / 返金時の UPDATE
- 管理画面の購入履歴照会

## ルール・ビジネスロジック

### メソッド

| メソッド | シグネチャ | 用途 |
|---------|----------|------|
| `findCompletedByUser(userId)` | `(userId: string) => Promise<EPurchase[]>` | アクセス権判定／自分の購入履歴 |
| `findById(id)` | `(id: string) => Promise<EPurchase \| null>` | 管理画面詳細 |
| `findByUserPaginated(userId, opts)` | フィルタ・ページング付 | GET /api/me/purchases |
| `findAdminPaginated(opts)` | userId / status / 期間 で絞る | GET /api/admin/purchases |
| `insertFromWebhook(input)` | stripe_session_id UNIQUE で冪等 | Webhook checkout.session.completed |
| `markRefunded(paymentIntentId)` | status='refunded' / refunded_at=now() | Webhook charge.refunded |
| `existsCompleted(userId, targetType, targetId)` | 排他的 FK のいずれかで既購入を判定 | /api/checkout バリデーション |

### `insertFromWebhook(input)`

- 入力：
  ```
  {
    user_id: string,
    course_id?: string,
    content_id?: string,
    stripe_session_id: string,
    stripe_payment_intent_id?: string,
    amount: number,
  }
  ```
- 排他制約：`course_id` と `content_id` は片方のみ NOT NULL（CHECK 制約）
- 冪等性：`stripe_session_id` UNIQUE 違反を捕捉 → 既存レコードを SELECT して返す
- status は常に `completed`、refunded_at は NULL で挿入

### `markRefunded(paymentIntentId)`

- `stripe_payment_intent_id` で検索
- 見つからない場合：例外（services 側で 200 + ログにする業務判断）
- 既に refunded：更新せず既存を返す（冪等）

### `existsCompleted(userId, targetType, targetId)`

- targetType に応じて WHERE 句を切替
- status='completed' のみ判定（refunded は除外＝既存仕様に従い再購入不可とするなら同様の方針で扱う）

### Service Role Key の使用

- `insertFromWebhook` `markRefunded` は Webhook ハンドラからのみ呼ばれる → Service Role Key の Supabase クライアントを引数で受ける
- それ以外のメソッドは通常クライアント（RLS あり）

## NG

- repositories で「既購入なので 409」を判定しない（services 側）
- `e_learning_legacy_purchases` を本 repository から書き込まない（別 repository / 移行スクリプト専用）
- 物理削除 (`DELETE`) を実装しない（税務観点・FK は RESTRICT）
- `status` を `'completed' | 'refunded'` 以外で扱わない（型レベルでも CHECK レベルでも禁止）
