-- =============================================================================
-- Phase 2 Step 2 / Sub 2a-3：RLS 修正（管理画面用テーブルの書き込み権限を service_role のみに）
--
-- 背景：security-authaudit + design-research 調査で「authenticated = 管理者」前提の
--       誤った RLS ポリシーが5テーブルに残存・本番で書き換え可能状態を発見し緊急対処
--
-- 方針：
-- - 管理画面は service_role キーで動作するため、authenticated 向け書き込みは不要
-- - 公開 SELECT は維持（カテゴリ・コンテンツ・資料の閲覧は壊さない）
-- - corporate_customers / corporate_users は管理者専用情報のため authenticated SELECT も削除
-- =============================================================================

-- e_learning_categories（公開 SELECT は維持・authenticated 全 CRUD ポリシー削除）
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON e_learning_categories;

-- e_learning_contents（公開 SELECT は維持・authenticated 全 CRUD ポリシー削除）
DROP POLICY IF EXISTS "Authenticated users can manage contents" ON e_learning_contents;

-- e_learning_materials（公開 SELECT は維持・authenticated 全 CRUD ポリシー削除）
DROP POLICY IF EXISTS "Authenticated users can manage materials" ON e_learning_materials;

-- e_learning_corporate_customers（管理者専用情報・SELECT も含めて全削除）
DROP POLICY IF EXISTS "Allow authenticated users to read corporate customers" ON e_learning_corporate_customers;
DROP POLICY IF EXISTS "Allow authenticated users to insert corporate customers" ON e_learning_corporate_customers;
DROP POLICY IF EXISTS "Allow authenticated users to update corporate customers" ON e_learning_corporate_customers;
DROP POLICY IF EXISTS "Allow authenticated users to delete corporate customers" ON e_learning_corporate_customers;

-- e_learning_corporate_users（管理者専用情報・authenticated 全 CRUD ポリシー削除）
DROP POLICY IF EXISTS "Allow authenticated users to manage corporate users" ON e_learning_corporate_users;
