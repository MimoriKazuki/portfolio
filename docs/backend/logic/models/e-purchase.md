# EPurchase / ELegacyPurchase モデル

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄）

## 概要

買い切り購入のレコード。Phase 1 の新ルールに準拠する `EPurchase` と、退避済み旧レコード（読み取りのみ）の `ELegacyPurchase`。

## 使用場面・責務

- EPurchase：Stripe Checkout 完了時の DB 反映 / 返金時の状態更新 / アクセス権判定 / 購入履歴表示
- ELegacyPurchase：歴史的レコードの保持（税務観点）。アプリ層からは読み取りのみ

## ルール・ビジネスロジック

### EPurchase フィールド

| フィールド | 型 | NOT NULL | 備考 |
|----------|-----|---------|------|
| `id` | string | ✓ | PK |
| `user_id` | string | ✓ | FK |
| `course_id` | string \| null |  | 排他的 FK |
| `content_id` | string \| null |  | 排他的 FK（既存からの継続フィールド） |
| `stripe_session_id` | string | ✓ | UNIQUE。varchar(255)。冪等キー |
| `stripe_payment_intent_id` | string \| null |  | 返金照合用（設計負債4・Phase 1 追加） |
| `amount` | number | ✓ | 円・購入時点固定 |
| `status` | `'completed' \| 'refunded'` | ✓ | L2 確定 |
| `refunded_at` | string \| null |  | status=refunded のとき NOT NULL |
| `created_at` `updated_at` | string | ✓ | timestamptz |

### ELegacyPurchase フィールド

| フィールド | 型 | NOT NULL | 備考 |
|----------|-----|---------|------|
| `id` | string | ✓ | 元 e_learning_purchases.id を引き継ぐ |
| `user_id` | string | ✓ | FK |
| `content_id` | string \| null |  | 元 content_id（NULL=全コンテンツ買い切り旧仕様） |
| `stripe_session_id` | string \| null |  | 部分 UNIQUE |
| `amount` | number | ✓ | |
| `status` | string | ✓ | |
| `refunded_at` | string \| null |  | 構造的整合のため保持（EPurchase と同形）。Phase 1 では legacy_purchases に対する返金処理は実装しないため値は移行時点のスナップショットを保持（通常 NULL） |
| `original_created_at` | string | ✓ | 元購入完了日時 |
| `migrated_at` | string | ✓ | 退避日時 |
| `note` | string \| null |  | 業務メモ |

> **legacy_purchases に対する返金処理の取扱（Phase 1 確定）**
> - 既存 6 件は移行と同時に `e_learning_users.has_full_access = true` を付与してフルアクセス権に吸収済（M5 安全順序）。よって運用上「legacy_purchases に対して返金処理を実行する」業務は発生しない
> - **Phase 1 では Webhook も含めて `e_learning_legacy_purchases` を書き換えない**（読み取り専用）
> - データ構造としては `refunded_at` を保持するが、これは将来仕様変更時の整合維持・税務照合のためであり Phase 1 でのアプリ層更新経路は存在しない

### 不変条件（EPurchase）

- 排他的 CHECK：`(course_id IS NOT NULL AND content_id IS NULL) OR (course_id IS NULL AND content_id IS NOT NULL)`
- status CHECK：`IN ('completed', 'refunded')`
- 退会・参照整合 CHECK：`(status = 'refunded' AND refunded_at IS NOT NULL) OR (status <> 'refunded' AND refunded_at IS NULL)`
- 部分 UNIQUE：`(user_id, course_id) WHERE course_id IS NOT NULL` ／ `(user_id, content_id) WHERE content_id IS NOT NULL`
  - 業務的に「同一 user が同一 target を completed で複数行持たない」を保証
  - ただし refunded 後の再購入は許容したい場合、status を含めた部分 UNIQUE に切り替えが必要 → Phase 1 では「返金後は同一 target を再購入できない」が業務確定（未確定の場合は plan-lead 経由でディレクター確認・現状は再購入不可で進める）
- 物理削除不可：FK は ON DELETE RESTRICT

### 派生属性（services 層で算出）

- 「有効な購入」：`status === 'completed'`
- 「返金済」：`status === 'refunded'`

## NG

- ELegacyPurchase に新規 INSERT を行わない（移行スクリプト 1 回のみ）
- EPurchase の `status` を `completed`/`refunded` 以外の値で扱わない（CHECK 違反）
- EPurchase の物理削除を実装しない（税務観点）
- 既存 6 件を `e_learning_purchases` から DELETE する手順は L3 確定の安全順序を厳守：
  1. ELegacyPurchase に INSERT
  2. 該当 6 名の `e_learning_users.has_full_access = true`
  3. アプリのアクセス判定を `has_full_access` 参照に切替
  4. 動作検証
  5. 元レコードを e_learning_purchases から DELETE
