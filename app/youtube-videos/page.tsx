import { createStaticClient } from '@/app/lib/supabase/static'
import MainLayout from '@/app/components/MainLayout'
import YouTubeVideosClient from './YouTubeVideosClient'
import { YouTubeVideo } from '@/app/types'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'YouTube - AI駆動研究所',
  description: 'AI駆動研究所のYouTubeコンテンツ一覧。生成AIの活用方法や最新技術の解説動画をご覧いただけます。',
  openGraph: {
    title: 'YouTube - AI駆動研究所',
    description: 'AI駆動研究所のYouTubeコンテンツ一覧。生成AIの活用方法や最新技術の解説動画をご覧いただけます。',
  },
}

export const revalidate = 60 // 1分ごとに再検証

async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  const supabase = createStaticClient()

  const { data: videos, error } = await supabase
    .from('youtube_videos')
    .select('*')

  if (error) {
    console.error('Error fetching YouTube videos:', error)
    return []
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

  return sortedVideos
}

export default async function YouTubeVideosPage() {
  const videos = await getYouTubeVideos()

  return (
    <MainLayout hideRightSidebar={true}>
      <YouTubeVideosClient videos={videos} />
    </MainLayout>
  )
}
