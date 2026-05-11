-- お知らせカテゴリの更新

-- まず既存のキャンペーンをイベントに更新
UPDATE notices SET category = 'event' WHERE category = 'campaign';

-- カテゴリの制約を一旦削除
ALTER TABLE notices DROP CONSTRAINT IF EXISTS notices_category_check;

-- 新しいカテゴリで制約を再作成（webinarを追加、campaignをeventに変更）
ALTER TABLE notices 
ADD CONSTRAINT notices_category_check 
CHECK (category IN ('news', 'webinar', 'update', 'maintenance', 'event', 'other'));

-- コメントを追加
COMMENT ON COLUMN notices.category IS 'お知らせのカテゴリ（news: ニュース, webinar: ウェビナー, update: アップデート, maintenance: メンテナンス, event: イベント, other: その他）';