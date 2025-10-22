-- Add is_own_channel column to youtube_videos table
-- This allows manual override of channel classification

ALTER TABLE youtube_videos
ADD COLUMN IF NOT EXISTS is_own_channel BOOLEAN DEFAULT false;

-- Set is_own_channel to true for videos from the main channel (UCKNiT_HYgBWMcFjaxZBpduQ)
UPDATE youtube_videos
SET is_own_channel = true
WHERE channel_id = 'UCKNiT_HYgBWMcFjaxZBpduQ';

-- Add comment to explain the column
COMMENT ON COLUMN youtube_videos.is_own_channel IS '自社チャンネルかどうか。手動で切り替え可能。';
