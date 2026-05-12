-- Add columns for YouTube Data API v3 integration
-- This migration adds fields to support both manual and automatic video imports

-- Add YouTube API data columns
ALTER TABLE youtube_videos
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS channel_title TEXT,
ADD COLUMN IF NOT EXISTS channel_id TEXT,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS import_source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN youtube_videos.published_at IS 'YouTube動画の公開日時';
COMMENT ON COLUMN youtube_videos.channel_title IS 'YouTubeチャンネル名';
COMMENT ON COLUMN youtube_videos.channel_id IS 'YouTubeチャンネルID';
COMMENT ON COLUMN youtube_videos.like_count IS '高評価数';
COMMENT ON COLUMN youtube_videos.comment_count IS 'コメント数';
COMMENT ON COLUMN youtube_videos.duration IS '動画の長さ（ISO 8601形式: PT1H2M10S）';
COMMENT ON COLUMN youtube_videos.import_source IS '取得元: manual（手動入力）または api（YouTube API経由）';
COMMENT ON COLUMN youtube_videos.last_synced_at IS '最終同期日時（API経由で統計情報を更新した日時）';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_youtube_videos_channel_id ON youtube_videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_published_at ON youtube_videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_import_source ON youtube_videos(import_source);

-- Add constraint to ensure import_source is valid
ALTER TABLE youtube_videos
ADD CONSTRAINT check_import_source CHECK (import_source IN ('manual', 'api'));
