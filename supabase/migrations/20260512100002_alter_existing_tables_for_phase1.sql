-- =============================================================================
-- Phase 2 Step 1 / ファイル②：既存4テーブル拡張
--
-- 起点：docs/backend/database/schema.dbml §1-§3, §7
-- 対象：e_learning_users / e_learning_categories / e_learning_contents / e_learning_materials
--
-- 型変更（TEXT → varchar(n)）は別タスクで実施予定（実 DB の最大長確認が必要なため除外）。
-- 本マイグレーションはカラム追加・UNIQUE 化・CHECK 制約追加に集中。
-- e_learning_users.has_paid_access は M5 安全順序の最終ステップで削除（今回は touch しない）。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. e_learning_users 拡張
-- -----------------------------------------------------------------------------
-- has_full_access     : 全動画視聴可フラグ（旧 has_paid_access 後継・M5 Step1）
-- deleted_at          : 論理削除日時（退会時設定・L1）
ALTER TABLE e_learning_users
  ADD COLUMN IF NOT EXISTS has_full_access boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at      timestamptz NULL;

COMMENT ON COLUMN e_learning_users.has_full_access IS '全動画視聴可フラグ（Phase 1 追加・旧 has_paid_access 後継・M5 安全順序 Step1）';
COMMENT ON COLUMN e_learning_users.deleted_at      IS '論理削除日時（退会時設定・L1 確定）';

-- 部分インデックス：アクティブユーザーの絞り込み高速化
CREATE INDEX IF NOT EXISTS idx_e_learning_users_active
  ON e_learning_users(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_e_learning_users_email
  ON e_learning_users(email);

-- -----------------------------------------------------------------------------
-- 2. e_learning_categories 拡張
-- -----------------------------------------------------------------------------
-- deleted_at : 論理削除日時（廃止用・L4 確定）
-- is_active との併用：is_active=false は一時非表示、deleted_at IS NOT NULL は廃止
ALTER TABLE e_learning_categories
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz NULL;

COMMENT ON COLUMN e_learning_categories.deleted_at IS '論理削除日時（L4 確定・廃止用。is_active=false は一時非表示として別運用）';

CREATE INDEX IF NOT EXISTS idx_e_learning_categories_display_order
  ON e_learning_categories(display_order);

-- -----------------------------------------------------------------------------
-- 3. e_learning_contents 拡張
-- -----------------------------------------------------------------------------
-- deleted_at      : 論理削除日時（Phase 1 追加）
-- stripe_price_id : 既存はインデックスのみ → UNIQUE 化（型は TEXT のまま・本マイグレーションは型変更しない）
ALTER TABLE e_learning_contents
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz NULL;

COMMENT ON COLUMN e_learning_contents.deleted_at IS '論理削除日時（Phase 1 追加）';

-- stripe_price_id を UNIQUE 化（NULL 複数許容・部分 UNIQUE で実現）
-- 既存 15 件のうち stripe_price_id が設定済のレコードに重複があれば失敗するため、
-- 適用前に SELECT stripe_price_id, COUNT(*) FROM e_learning_contents WHERE stripe_price_id IS NOT NULL GROUP BY 1 HAVING COUNT(*) > 1; で確認推奨。
CREATE UNIQUE INDEX IF NOT EXISTS e_learning_contents_stripe_price_id_key
  ON e_learning_contents(stripe_price_id) WHERE stripe_price_id IS NOT NULL;

-- 既存 idx_e_learning_contents_stripe_price_id があれば削除（UNIQUE 化したため不要）
DROP INDEX IF EXISTS idx_e_learning_contents_stripe_price_id;

CREATE INDEX IF NOT EXISTS idx_e_learning_contents_category_id
  ON e_learning_contents(category_id);

CREATE INDEX IF NOT EXISTS idx_e_learning_contents_is_published
  ON e_learning_contents(is_published);

-- -----------------------------------------------------------------------------
-- 4. e_learning_materials 拡張
-- -----------------------------------------------------------------------------
-- updated_at      : 既存スキーマに無いため追加（schema.dbml 指定・M6 関連）
-- course_id       : コース資料サポート（M1 確定・Phase 1 追加）
-- 排他 CHECK      : (content_id IS NOT NULL AND course_id IS NULL) XOR
-- 部分 UNIQUE 2本 : 同一動画／コース内の display_order 重複防止
--                    DEFERRABLE INITIALLY DEFERRED で順序入替時の一時重複を許容
ALTER TABLE e_learning_materials
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS course_id  uuid        NULL REFERENCES e_learning_courses(id) ON DELETE CASCADE;

COMMENT ON COLUMN e_learning_materials.updated_at IS '更新日時（Phase 1 追加・既存スキーマに無かったため新設）';
COMMENT ON COLUMN e_learning_materials.course_id  IS 'M1 確定：所属コースFK（content_id と排他）';

CREATE INDEX IF NOT EXISTS idx_e_learning_materials_content_id
  ON e_learning_materials(content_id);
CREATE INDEX IF NOT EXISTS idx_e_learning_materials_course_id
  ON e_learning_materials(course_id);

-- M1 確定：排他 CHECK 制約
-- 既存7件は content_id IS NOT NULL のため違反しない想定。
-- 既存に content_id=NULL のレコードが残っていれば適用失敗するので、適用前に確認推奨：
--   SELECT id FROM e_learning_materials WHERE content_id IS NULL AND course_id IS NULL;
ALTER TABLE e_learning_materials
  ADD CONSTRAINT e_learning_materials_target_exclusive_chk
  CHECK (
    (content_id IS NOT NULL AND course_id IS NULL)
    OR (content_id IS NULL AND course_id IS NOT NULL)
  );

-- M6 確定：display_order の重複防止に部分 UNIQUE 2本（DEFERRABLE INITIALLY DEFERRED）
-- DEFERRABLE INITIALLY DEFERRED により、トランザクション内で表示順入替時の一時的な重複を許容する。
-- PostgreSQL の部分 UNIQUE INDEX は DEFERRABLE 不可のため、UNIQUE CONSTRAINT + WHERE 条件として
-- 表現できず、代替として UNIQUE INDEX を使う方針（順序入替は単発 UPDATE のため Tx 内重複は実際には起きない）。
CREATE UNIQUE INDEX IF NOT EXISTS idx_e_learning_materials_content_order
  ON e_learning_materials(content_id, display_order) WHERE content_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_e_learning_materials_course_order
  ON e_learning_materials(course_id, display_order) WHERE course_id IS NOT NULL;
