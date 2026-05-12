-- =============================================================================
-- Phase 2 Step 1 / ファイル③：legacy_purchases 新規 + 既存6件退避処理
--
-- 起点：docs/backend/database/schema.dbml §9, schema-rationale.md §C1 / §15 Tx-2
-- 対象：e_learning_legacy_purchases 新規作成 + 既存6件の Tx-2 原子的退避
--
-- L3 確定：既存購入6件（content_id IS NULL = 全コンテンツ買い切り旧仕様）は
--          physical 削除しない（税務 7 年保持義務）。本テーブルに退避し、
--          該当6名の has_full_access=true を一括付与してから元 DELETE。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. e_learning_legacy_purchases テーブル新規作成
-- -----------------------------------------------------------------------------
-- 本テーブルは新ルールの CHECK 制約を持たない（歴史的レコードを許容）
-- ON DELETE RESTRICT（物理削除不可・税務観点）
CREATE TABLE e_learning_legacy_purchases (
  id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid          NOT NULL REFERENCES e_learning_users(id) ON DELETE RESTRICT,
  content_id          uuid          NULL REFERENCES e_learning_contents(id) ON DELETE RESTRICT,
  stripe_session_id   varchar(255)  NULL,
  amount              integer       NOT NULL,
  status              varchar(20)   NOT NULL DEFAULT 'completed',
  original_created_at timestamptz   NOT NULL,
  migrated_at         timestamptz   NOT NULL DEFAULT timezone('utc'::text, now()),
  note                text          NULL
);

CREATE INDEX idx_e_learning_legacy_purchases_user_id ON e_learning_legacy_purchases(user_id);

-- M6 確定：stripe_session_id 部分 UNIQUE（NULL 除外・歴史的レコードでの重複防止）
CREATE UNIQUE INDEX idx_e_learning_legacy_purchases_stripe_session_id
  ON e_learning_legacy_purchases(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

COMMENT ON TABLE  e_learning_legacy_purchases                     IS 'L3 確定：旧仕様（全コンテンツ買い切り）の購入履歴退避テーブル。物理削除不可・税務観点。INSERT 後に更新しない運用のため updated_at は持たない';
COMMENT ON COLUMN e_learning_legacy_purchases.content_id          IS '元 content_id（NULL=全コンテンツ買い切りの歴史的レコード）';
COMMENT ON COLUMN e_learning_legacy_purchases.original_created_at IS '元購入完了日時（移行元の created_at）';
COMMENT ON COLUMN e_learning_legacy_purchases.migrated_at         IS 'L3 退避日時';
COMMENT ON COLUMN e_learning_legacy_purchases.note                IS 'M3／L3 の業務的メモ（例：全コンテンツ買い切り旧仕様）';

-- -----------------------------------------------------------------------------
-- 2. RLS（schema-rationale.md §C1-2 e_learning_legacy_purchases）
-- -----------------------------------------------------------------------------
-- anon         : 不可
-- authenticated: 自己レコードのみ SELECT 可（INSERT/UPDATE/DELETE は不可）
-- service_role : マイグレーション時の退避処理でのみ INSERT
ALTER TABLE e_learning_legacy_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own legacy purchases"
  ON e_learning_legacy_purchases FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 3. Tx-2 退避処理（schema-rationale.md §15 Tx-2）
-- -----------------------------------------------------------------------------
-- ※ 必ず 3 ステップを同一 Tx で実行：途中失敗で全ロールバック
--   - 部分的な退避が残ると後続のファイル④で追加する CHECK 制約が失敗するため、原子的に実行する
-- ※ 適用前の事前確認推奨：
--   SELECT COUNT(*) FROM e_learning_purchases WHERE content_id IS NULL;
--   → CLAUDE.md 記載の「既存購入 6 件・全コンテンツ買い切り」と一致することを確認
BEGIN;

  -- Step 1: 既存6件（content_id IS NULL = 全コンテンツ買い切り）を退避
  --         元 id・user_id・content_id・stripe_session_id・amount・status・created_at をコピー
  INSERT INTO e_learning_legacy_purchases (
    id, user_id, content_id, stripe_session_id, amount, status, original_created_at, note
  )
  SELECT
    id,
    user_id,
    content_id,
    stripe_session_id,
    amount,
    status,
    created_at,
    '全コンテンツ買い切り旧仕様'
  FROM e_learning_purchases
  WHERE content_id IS NULL;

  -- Step 2: 該当ユーザーに has_full_access=true を付与（M5 安全順序 Step2）
  --         updated_at も同時に更新
  -- レビュー指摘①対応：UPDATE 範囲を「今回退避対象のみ」に厳密に絞る。
  --   - e_learning_legacy_purchases 全体を参照すると、将来このテーブルに別経路で
  --     レコードが追加された場合に意図しないユーザーへ付与されるリスクがある。
  --   - Step 3 の DELETE より前に実行しているため、元 e_learning_purchases の
  --     content_id IS NULL 条件で「今回退避対象6名」を一意に特定できる。
  UPDATE e_learning_users
     SET has_full_access = true,
         updated_at      = timezone('utc'::text, now())
   WHERE id IN (
     SELECT user_id FROM e_learning_purchases WHERE content_id IS NULL
   );

  -- Step 3: 元 e_learning_purchases から該当6件を DELETE
  --         （ファイル④で追加する排他 CHECK 制約 (course_id XOR content_id) を満たすため）
  DELETE FROM e_learning_purchases WHERE content_id IS NULL;

COMMIT;
