-- =============================================================================
-- Phase 2 Step 2 / Sub 2f / Step 2：has_paid_access カラム削除
--
-- M5 安全順序 Step5（最終）：
--   Step 1: has_full_access カラム追加（Sub 2b ファイル②で実施済）
--   Step 2: 既存6名に has_full_access=true 付与（Sub 2b ファイル③ Tx-2 で実施済）
--   Step 3: アプリコード切替（Sub 2b〜2e で has_paid_access 参照を全削除）
--   Step 4: 動作検証（123件ユニットテストパス・本番運用確認）
--   Step 5: has_paid_access カラム削除 ← 本マイグレーション
--
-- 前提：
-- - アプリコードに has_paid_access への参照ゼロ（M5 説明コメントのみ）
-- - 3名手動付与組に has_full_access=true 付与済（Sub 2f Step 1 マイグレーションで実施）
-- =============================================================================

ALTER TABLE e_learning_users
  DROP COLUMN has_paid_access;
