-- =============================================================================
-- Phase 2 Step 1 / ファイル④：e_learning_purchases 再設計
--
-- 起点：docs/backend/database/schema.dbml §8, schema-rationale.md §C1 / §15 Tx-1
-- 対象：カラム追加・UNIQUE 再設計・CHECK 制約・FK 変更
--
-- 前提：ファイル③で content_id IS NULL の歴史的レコードは退避済み（CHECK 制約が通る前提）
-- 型変更（TEXT → varchar(n)）は別タスクで実施予定（実 DB の最大長確認が必要なため除外）。
-- status のみ NOT NULL 化 + CHECK 制約を追加（L2 確定・型は TEXT のまま）。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. 既存マイグレーション欠落カラムの補完
-- -----------------------------------------------------------------------------
-- updated_at: 既存スキーマに無いため追加（schema.dbml 指定）
ALTER TABLE e_learning_purchases
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now());

COMMENT ON COLUMN e_learning_purchases.updated_at IS '更新日時（Phase 1 追加・status 変更時に更新）';

-- -----------------------------------------------------------------------------
-- 2. 新規カラム追加
-- -----------------------------------------------------------------------------
-- course_id                : 購入対象コースFK（Phase 1 追加・content_id と排他）
-- stripe_payment_intent_id : Stripe Payment Intent ID（返金照合用・設計負債4）
-- refunded_at              : 返金日時（status=refunded のとき NOT NULL）
ALTER TABLE e_learning_purchases
  ADD COLUMN IF NOT EXISTS course_id                uuid        NULL REFERENCES e_learning_courses(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text        NULL,
  ADD COLUMN IF NOT EXISTS refunded_at              timestamptz NULL;

COMMENT ON COLUMN e_learning_purchases.course_id                IS '購入対象コースFK（Phase 1 追加・content_id と排他）';
COMMENT ON COLUMN e_learning_purchases.stripe_payment_intent_id IS 'Stripe Payment Intent ID（返金照合用・Phase 1 追加・設計負債4・型は別タスクで varchar(255) 化予定）';
COMMENT ON COLUMN e_learning_purchases.refunded_at              IS '返金日時（status=refunded のとき NOT NULL・Phase 1 追加）';

-- -----------------------------------------------------------------------------
-- 3. status の NOT NULL 化 + CHECK 制約追加（L2 確定・型は TEXT のまま）
-- -----------------------------------------------------------------------------
-- 既存 status TEXT DEFAULT 'completed' は NOT NULL 化されていなかったため、ここで NOT NULL 化。
-- 既存6件は退避済みなので残レコードの status は 'completed' のみ想定。
-- 念のため NULL のレコードがあれば 'completed' で埋める。
UPDATE e_learning_purchases SET status = 'completed' WHERE status IS NULL;

ALTER TABLE e_learning_purchases
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'completed';

-- L2 確定：status は 'completed' / 'refunded' の 2 区分のみ
ALTER TABLE e_learning_purchases
  ADD CONSTRAINT e_learning_purchases_status_chk
  CHECK (status IN ('completed', 'refunded'));

-- refunded_at 整合 CHECK：status='refunded' なら NOT NULL、それ以外は NULL
ALTER TABLE e_learning_purchases
  ADD CONSTRAINT e_learning_purchases_refunded_at_chk
  CHECK (
    (status = 'refunded' AND refunded_at IS NOT NULL)
    OR (status <> 'refunded' AND refunded_at IS NULL)
  );

-- -----------------------------------------------------------------------------
-- 4. 排他 CHECK 制約：(course_id IS NOT NULL AND content_id IS NULL) XOR
-- -----------------------------------------------------------------------------
-- ※ ファイル③で既存6件（content_id IS NULL）を退避済みのため、残レコードは全て content_id IS NOT NULL
ALTER TABLE e_learning_purchases
  ADD CONSTRAINT e_learning_purchases_target_exclusive_chk
  CHECK (
    (course_id IS NOT NULL AND content_id IS NULL)
    OR (course_id IS NULL AND content_id IS NOT NULL)
  );

-- -----------------------------------------------------------------------------
-- 5. UNIQUE 再設計
-- -----------------------------------------------------------------------------
-- 既存 UNIQUE(user_id, content_id) を DROP → 部分 UNIQUE 2 本（course / content）に分割
ALTER TABLE e_learning_purchases
  DROP CONSTRAINT IF EXISTS e_learning_purchases_user_id_content_id_key;

-- 部分 UNIQUE：同一ユーザーが同じコースを 2 回購入できない
CREATE UNIQUE INDEX e_learning_purchases_user_course_partial_key
  ON e_learning_purchases(user_id, course_id) WHERE course_id IS NOT NULL;

-- 部分 UNIQUE：同一ユーザーが同じ単体動画を 2 回購入できない
CREATE UNIQUE INDEX e_learning_purchases_user_content_partial_key
  ON e_learning_purchases(user_id, content_id) WHERE content_id IS NOT NULL;

-- stripe_session_id UNIQUE 化（既存スキーマでは UNIQUE 制約なし）
-- Stripe Webhook 冪等性保証の要（schema-rationale.md §15 Tx-1）
CREATE UNIQUE INDEX IF NOT EXISTS e_learning_purchases_stripe_session_id_key
  ON e_learning_purchases(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 6. インデックス追加（FK・ステータス検索パターン用）
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_e_learning_purchases_user_id    ON e_learning_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_e_learning_purchases_course_id  ON e_learning_purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_e_learning_purchases_content_id ON e_learning_purchases(content_id);
CREATE INDEX IF NOT EXISTS idx_e_learning_purchases_status     ON e_learning_purchases(status);

-- -----------------------------------------------------------------------------
-- 7. FK の ON DELETE 方針変更（CASCADE → RESTRICT）
-- -----------------------------------------------------------------------------
-- 既存 FK は ON DELETE CASCADE だが、税務 7 年保持義務観点で物理削除不可とするため RESTRICT に変更
-- ユーザー / コンテンツの論理削除は deleted_at 設定で対応（物理削除は購入履歴の関係上発生しない設計）
ALTER TABLE e_learning_purchases
  DROP CONSTRAINT IF EXISTS e_learning_purchases_user_id_fkey,
  DROP CONSTRAINT IF EXISTS e_learning_purchases_content_id_fkey;

ALTER TABLE e_learning_purchases
  ADD CONSTRAINT e_learning_purchases_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES e_learning_users(id) ON DELETE RESTRICT,
  ADD CONSTRAINT e_learning_purchases_content_id_fkey
    FOREIGN KEY (content_id) REFERENCES e_learning_contents(id) ON DELETE RESTRICT;

-- -----------------------------------------------------------------------------
-- 8. RLS ポリシー整合性の確認（schema-rationale.md §C1 e_learning_purchases）
-- -----------------------------------------------------------------------------
-- レビュー指摘②対応：既存 RLS の整合性を本ファイルで確認・担保する。
--
-- 既存マイグレーション（20251203093613_create_e_learning_tables.sql）の調査結果：
--   1. ALTER TABLE e_learning_purchases ENABLE ROW LEVEL SECURITY 済
--   2. "Users can view own purchases" (FOR SELECT) ポリシーのみ定義済
--      USING: user_id IN (SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid())
--   3. INSERT / UPDATE / DELETE ポリシーは未定義
--
-- PostgreSQL の RLS 仕様：
--   - RLS 有効化済 + 該当操作のポリシー未定義
--     ⇒ anon / authenticated は該当操作を実行できない（service_role はバイパス）
--
-- schema-rationale.md §C1 マトリクスとの整合：
--   - anon          : SELECT/INSERT/UPDATE/DELETE 全て不可 ✅
--   - authenticated : SELECT 自己のみ可・INSERT/UPDATE/DELETE 不可 ✅
--   - service_role  : 全可（RLS バイパス・Stripe Webhook で INSERT/UPDATE 実行） ✅
--
-- ⇒ 結論：既存 RLS は schema-rationale.md §C1 と完全に整合。本ファイルでの修正は不要。
--    course_id 追加・FK 変更後も既存 SELECT ポリシーの USING 条件は不変のため動作影響なし。
--
-- 後続の Phase 2 Step 2 以降で Stripe Webhook 経由の INSERT を実装する際は、
-- service_role キー（SUPABASE_SERVICE_ROLE_KEY）を使用すること（schema-rationale.md §C1 §Tx-1）。
