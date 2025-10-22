import { createClient } from '@/app/lib/supabase/server'
import YouTubeVideosClient from './YouTubeVideosClient'

export const revalidate = 30 // 30秒ごとに再検証

export default async function AdminYouTubeVideosPage() {
  const supabase = await createClient()

  const { data: videos, error } = await supabase
    .from('youtube_videos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching YouTube videos:', error)
  }

  return <YouTubeVideosClient videos={videos || []} />
}
