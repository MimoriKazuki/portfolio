-- e_learning_contentsテーブルから不要なカラムを削除
ALTER TABLE e_learning_contents
DROP COLUMN IF EXISTS price,
DROP COLUMN IF EXISTS stripe_price_id,
DROP COLUMN IF EXISTS duration,
DROP COLUMN IF EXISTS display_order;
