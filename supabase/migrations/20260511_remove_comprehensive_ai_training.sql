-- comprehensive-ai-training 廃止に伴うDB更新
-- 1. youtube_videos.enterprise_service の DEFAULT 値を ai-coding-training に変更
-- 2. 既存レコードのうち enterprise_service = 'comprehensive-ai-training' を 'ai-coding-training' に更新
-- 3. contacts.service_type のコメント注釈も更新（カラム自体は VARCHAR で値制約なし）

-- youtube_videos: DEFAULT 値変更
ALTER TABLE youtube_videos
  ALTER COLUMN enterprise_service SET DEFAULT 'ai-coding-training';

-- youtube_videos: 既存レコードの値更新
UPDATE youtube_videos
SET enterprise_service = 'ai-coding-training'
WHERE enterprise_service = 'comprehensive-ai-training';

-- contacts: 既存レコードの service_type 更新（comprehensive-ai-training を受信したお問い合わせがある場合）
-- ※ 値の制約は SQL で表現されていないため、コメントのみ。実体は contacts.service_type のコメント更新で対応
COMMENT ON COLUMN contacts.service_type IS
  'お問い合わせ対象サービスID。enterprise: ai-coding-training, claude-training, ai-organization-os, ai-video-training, ai-short-video-training, ai-animation-training / individual: ai-talent-development';
