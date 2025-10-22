-- Create youtube_videos table
CREATE TABLE IF NOT EXISTS youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  enterprise_service TEXT DEFAULT 'comprehensive-ai-training',
  individual_service TEXT DEFAULT 'individual-coaching'
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_youtube_videos_display_order ON youtube_videos(display_order);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_featured ON youtube_videos(featured);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_created_at ON youtube_videos(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to youtube_videos"
  ON youtube_videos
  FOR SELECT
  TO public
  USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert youtube_videos"
  ON youtube_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated users to update youtube_videos"
  ON youtube_videos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete youtube_videos"
  ON youtube_videos
  FOR DELETE
  TO authenticated
  USING (true);

-- Add comment to table
COMMENT ON TABLE youtube_videos IS 'YouTube動画の管理テーブル';
COMMENT ON COLUMN youtube_videos.youtube_url IS 'YouTube動画のURL';
COMMENT ON COLUMN youtube_videos.youtube_video_id IS 'YouTubeから抽出された動画ID';
COMMENT ON COLUMN youtube_videos.thumbnail_url IS 'YouTube動画のサムネイルURL';
COMMENT ON COLUMN youtube_videos.enterprise_service IS '紐付けられた法人向けサービスID';
COMMENT ON COLUMN youtube_videos.individual_service IS '紐付けられた個人向けサービスID';
