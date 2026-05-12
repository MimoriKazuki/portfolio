-- e_learning_contentsテーブルにStripe関連フィールドを追加
ALTER TABLE e_learning_contents
ADD COLUMN IF NOT EXISTS price integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_price_id text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS duration text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- コメント追加
COMMENT ON COLUMN e_learning_contents.price IS '価格（円）。nullの場合は無料';
COMMENT ON COLUMN e_learning_contents.stripe_price_id IS 'Stripeの価格ID（price_xxxxx形式）';
COMMENT ON COLUMN e_learning_contents.duration IS '動画の長さ（例: 10:30）';
COMMENT ON COLUMN e_learning_contents.display_order IS '表示順序';
