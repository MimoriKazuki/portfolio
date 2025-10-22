import { createClient } from '@/app/lib/supabase/server'
import YouTubeVideosClient from './YouTubeVideosClient'

export const dynamic = 'force-dynamic' // 常に最新データを取得
export const revalidate = 0 // キャッシュを無効化

export default async function AdminYouTubeVideosPage() {
  const supabase = await createClient()

  const { data: videos, error } = await supabase
    .from('youtube_videos')
    .select('*')

  if (error) {
    console.error('Error fetching YouTube videos:', error)
  }

  // 外部チャンネルはcreated_at、自社チャンネルはpublished_atでソート
  const sortedVideos = (videos || []).sort((a, b) => {
    const dateA = !a.is_own_channel
      ? new Date(a.created_at).getTime()
      : new Date(a.published_at || a.created_at).getTime()

    const dateB = !b.is_own_channel
      ? new Date(b.created_at).getTime()
      : new Date(b.published_at || b.created_at).getTime()

    // 降順（新しい順）
    return dateB - dateA
  })

  return <YouTubeVideosClient videos={sortedVideos} />
}
