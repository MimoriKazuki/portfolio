-- Add view_count column to youtube_videos table
ALTER TABLE youtube_videos
ADD COLUMN view_count INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN youtube_videos.view_count IS 'YouTube動画の再生回数';
