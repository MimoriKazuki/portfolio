-- 注目のお知らせを1つに制限するトリガーを作成
CREATE OR REPLACE FUNCTION enforce_single_featured_notice()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_featured = true THEN
    -- 他のすべてのお知らせの注目フラグをfalseに設定
    UPDATE notices 
    SET is_featured = false 
    WHERE id != NEW.id AND is_featured = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
DROP TRIGGER IF EXISTS enforce_single_featured_notice_trigger ON notices;
CREATE TRIGGER enforce_single_featured_notice_trigger
BEFORE INSERT OR UPDATE OF is_featured ON notices
FOR EACH ROW
WHEN (NEW.is_featured = true)
EXECUTE FUNCTION enforce_single_featured_notice();

-- 関数にコメントを追加
COMMENT ON FUNCTION enforce_single_featured_notice() IS '注目のお知らせを1つまでに制限する';