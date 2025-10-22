import { Suspense } from 'react'
import { createStaticClient } from '@/app/lib/supabase/static'
import MainLayout from '@/app/components/MainLayout'
import YouTubeVideosClient from './YouTubeVideosClient'
import { YouTubeVideo } from '@/app/types'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'YouTube動画 - AI駆動研究所',
  description: 'AI駆動研究所のYouTube動画コンテンツ一覧。生成AIの活用方法や最新技術の解説動画をご覧いただけます。',
  openGraph: {
    title: 'YouTube動画 - AI駆動研究所',
    description: 'AI駆動研究所のYouTube動画コンテンツ一覧。生成AIの活用方法や最新技術の解説動画をご覧いただけます。',
  },
}

export const revalidate = 60 // 1分ごとに再検証

async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  const supabase = createStaticClient()

  const { data: videos, error } = await supabase
    .from('youtube_videos')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching YouTube videos:', error)
    return []
  }

  return videos || []
}

export default async function YouTubeVideosPage() {
  const videos = await getYouTubeVideos()

  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <YouTubeVideosClient videos={videos} />
      </Suspense>
    </MainLayout>
  )
}
