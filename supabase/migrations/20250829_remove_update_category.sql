-- アップデートカテゴリの削除

-- まず既存のアップデートを他のカテゴリに移行（ニュースに移行）
UPDATE notices SET category = 'news' WHERE category = 'update';

-- カテゴリの制約を一旦削除
ALTER TABLE notices DROP CONSTRAINT IF EXISTS notices_category_check;

-- アップデートを除いた新しいカテゴリで制約を再作成
ALTER TABLE notices 
ADD CONSTRAINT notices_category_check 
CHECK (category IN ('news', 'webinar', 'event', 'maintenance', 'other'));

-- コメントを更新
COMMENT ON COLUMN notices.category IS 'お知らせのカテゴリ（news: ニュース, webinar: ウェビナー, event: イベント, maintenance: メンテナンス, other: その他）';