# stripe-webhook-service

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄）

## 概要

Stripe Webhook を受信して DB を反映するサービス。Service Role Key の Supabase クライアントを使用（RLS を迂回）。

## 使用場面・責務

- `/api/stripe/webhook` から呼ばれる
- 受信した Event の type に応じて handler を分岐
- 購入レコードの INSERT / UPDATE を冪等に行う

## ルール・ビジネスロジック

### 対象イベント（Phase 1 確定）

| イベント | 処理 |
|---------|------|
| `checkout.session.completed` | `handleCheckoutCompleted` で purchase INSERT |
| `charge.refunded` | `handleChargeRefunded` で purchase を `refunded` に更新 |
| それ以外 | ログのみ・200 OK |

サブスク系（`customer.subscription.*` / `invoice.*`）は対象外（サブスク廃止のため）。

### `dispatch(event)`

```
1. event.type で分岐
2. 対象 type 以外は 200 OK で終了（無視・ログのみ）
3. 例外は呼び出し側（controllers）で 500 へ翻訳
```

### `handleCheckoutCompleted(event)`

1. **署名検証は controllers 側で済んでいる前提**
2. `event.data.object` = Stripe Session object を取得
3. `metadata` から `user_id` / `target_type` / `target_id` を取り出す
   - 欠落していれば Slack 通知し 200 OK で終了（DB には書かない）
4. `payment_intent` を取得（id 文字列）
5. `PurchaseRepository.insertFromWebhook` を呼ぶ：
   - 入力：
     ```
     user_id,
     course_id?: target_type==='course'  ? target_id : null,
     content_id?: target_type==='content' ? target_id : null,
     stripe_session_id: event.data.object.id,
     stripe_payment_intent_id: payment_intent_id,
     amount: event.data.object.amount_total ?? 0,
     ```
6. UNIQUE 違反（既処理）→ 既存レコードを返し 200 OK
7. 既存実装の Slack 通知（購入完了アナウンス）を維持・拡張：
   - 表示項目を「全コンテンツアクセス」固定から「コース名 or 単体動画名」に変更

### `handleChargeRefunded(event)`

1. `event.data.object` = Charge object
2. `payment_intent` を取得
3. `PurchaseRepository.markRefunded(paymentIntentId)`：
   - status='refunded'、refunded_at=now() に更新
   - 対象が見つからない場合：Slack 通知し 200 OK 終了（順序逆転対策）
   - 既に refunded：更新せず 200 OK（冪等）
4. Slack 通知（返金完了）を送る

### 署名検証

- controllers 側で `stripe.webhooks.constructEvent(body, signature, endpointSecret)` を呼ぶ
- 失敗 → 400 STRIPE_SIGNATURE_INVALID（リトライ無効化）
- services 層は検証済みの event オブジェクトを受け取る

### 順序逆転・遅延

- Stripe は最大 72 時間自動リトライ
- 同一 event の重複受信は冪等処理で吸収（UNIQUE / 既 refunded チェック）
- `charge.refunded` が先に到達した場合：未対応として Slack 通知し、`checkout.session.completed` が後で来た時に INSERT、その後 `charge.refunded` のリトライで refunded 更新が成立

### HTTP ステータス指針

- 署名検証失敗 → 400（Stripe 側リトライしない）
- 処理失敗（DB 例外 等）→ 500（Stripe 側リトライ）
- 既処理重複・対象外 type・metadata 欠落 → 200（リトライさせない）

### ログ・通知

- 全 event：`event.id` と `event.type` を必ずログ
- 失敗時：Slack に `event.id` `event.type` `error.message` を通知
- 成功時：購入完了・返金完了の人間向け通知を Slack に投稿（既存通知メカニズム流用）

### Service Role Key の使用範囲

- このサービス内のみ。リクエスト元の Cookie に依存しないため RLS を迂回
- ほかの場所からは絶対に呼び出さない

## NG

- Webhook で `has_full_access` を切り替えない（運営手動切替のみ）
- `e_learning_legacy_purchases` を Webhook から書き換えない
- 署名検証を services 側でやらない（controllers 側で確実に・services は検証済前提）
- 失敗時に 4xx で返してリトライ無効化しない（5xx で Stripe にリトライさせる）
- 既存の `STRIPE_E_LEARNING_PRICE_ID` 固定方式に依存しない（DB の `stripe_price_id` を使う）
