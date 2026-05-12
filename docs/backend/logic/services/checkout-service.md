# checkout-service

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄）

## 概要

Stripe Checkout Session の作成を担うサービス。買い切り（One-time）モードでコースまたは単体動画を販売する。

## 使用場面・責務

- `/api/checkout` から呼ばれる
- Stripe SDK を直接叩く唯一の出口（Webhook 側を除く）
- 購入可否のビジネスチェックを行ってから Stripe Session を作成
- DB 書き込みは行わない（書き込みは Webhook 側）

## ルール・ビジネスロジック

### メソッド

`startCheckout(input)`

- 入力：
  ```
  {
    userId: string,            // e_learning_users.id
    targetType: 'course' | 'content',
    targetId: string,
    cancelReturnUrl?: string,  // サイト内パスのみ
  }
  ```
- 出力：
  ```
  { checkout_url: string; stripe_session_id: string }
  ```

### バリデーション（前提チェック）

1. **target 取得**
   - `targetType === 'course'`：`CourseRepository.findById(targetId)`
   - `targetType === 'content'`：`ContentRepository.findById(targetId)`
   - 取得失敗 / `is_published=false` / `deleted_at !== null` → 404 NOT_FOUND

2. **無料商品の購入拒否**
   - target.is_free === true → 400 BAD_REQUEST

3. **stripe_price_id 必須**
   - target.stripe_price_id == null → 500 INTERNAL_ERROR（公開済の有料商品なのに Stripe Price 未設定＝設計エラー）
   - 管理側のバリデーションで本来発生しない（PATCH /api/admin/courses で is_published=true 時に必須化）

4. **既購入チェック**
   - `PurchaseRepository.existsCompleted(userId, targetType, targetId)` が true → 409 ALREADY_PURCHASED

5. **フルアクセスチェック**
   - `UserRepository.findById(userId).has_full_access === true` → 409 ALREADY_FULL_ACCESS（テスト課金が必要な場合は管理画面側で別系統＝Phase 1 では未実装）

### cancel_return_url の検証

- 既存 Stripe checkout の実装と整合させる：
  - 文字列であり
  - `/` で始まり
  - `://` を含まない
- 不正なら `/e-learning` をフォールバック

### Stripe Session 作成

```
stripe.checkout.sessions.create({
  mode: 'payment',
  payment_method_types: ['card'],
  line_items: [{ price: target.stripe_price_id, quantity: 1 }],
  customer_email: user.email,  // 任意・存在すれば付与
  success_url: <成功時 URL>,
  cancel_url:  <キャンセル時 URL>,
  metadata: {
    user_id:     <e_learning_users.id>,
    target_type: 'course' | 'content',
    target_id:   <uuid>,
  },
})
```

### success_url / cancel_url の決定

- `success_url`：**FE 設計 B009「決済完了ページ」へ統一**
  - 形式：`${BASE_URL}/e-learning/checkout/complete?session_id={CHECKOUT_SESSION_ID}`
  - Stripe の `{CHECKOUT_SESSION_ID}` プレースホルダ機能を使用（Stripe Session 作成時にそのまま記述・Stripe が確定 session.id に置換）
  - `/e-learning/checkout/complete` ページ側で `session_id` を読み取り、`GET /api/me/access` をポーリングして購入反映を待機する（詳細は access-service.md §「購入完了直後の視聴権限確認フロー」）
  - 反映確認後、コース／単体動画詳細へリダイレクト（target_type と target_id は完了ページ側で metadata から復元）
- `cancel_url`：`${BASE_URL}${cancel_return_url || '/e-learning'}`

### 既存実装からの差分

- 既存：固定 `STRIPE_E_LEARNING_PRICE_ID` を全コンテンツ買い切り 1 種類でハードコード
- 新規：DB 側に `stripe_price_id` を持ち、コース／単体動画ごとに対応
- 既存：`has_paid_access` で既購入判定
- 新規：access-service / PurchaseRepository を経由して `has_full_access` + per-target 購入で判定（M5 段階移行）

## NG

- DB に購入レコードを書き込まない（Webhook 経由のみ）
- `cancel_return_url` に外部 URL を許可しない（オープンリダイレクト防止）
- Stripe Customer の自動作成・保存を Phase 1 では行わない（必要なら customer_email のみ）
- 同一 user × 同一 target で Checkout Session を複数同時に作成する制御は持たない（Stripe 側で別 Session として扱われる・DB 反映は最初に完了したものが UNIQUE で勝つ）
- 無料商品・フルアクセス権者の Checkout を Stripe へ流さない（業務的に金額 0 円や重複付与を防ぐ）
