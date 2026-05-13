-- =============================================================================
-- Phase 2 Step 2 / Sub 2f / Step 1：has_paid_access=true かつ has_full_access=false の
--                                   ユーザーに has_full_access=true を付与
--
-- 背景：M5 段階移行最終 Step（カラム削除）前の整合性確保。
--       Sub 2b ファイル③で購入者6名には has_full_access 付与済だが、
--       手動付与組3名（kazuki mimori / Nae K / デジタルキロン）は
--       has_paid_access=true のままだった。
--
-- Kosuke 承認（A案）：既得権保護のため3名にも has_full_access=true を付与してから
-- has_paid_access カラムを削除する。
-- =============================================================================

-- 対象3名に has_full_access=true を付与（updated_at も更新）
UPDATE e_learning_users
   SET has_full_access = true,
       updated_at      = timezone('utc'::text, now())
 WHERE has_paid_access = true AND has_full_access = false;

-- 整合性検証（コメント・運用確認用）：
-- SELECT COUNT(*) FROM e_learning_users
--  WHERE has_paid_access = true AND has_full_access = false;
-- 期待値：0
