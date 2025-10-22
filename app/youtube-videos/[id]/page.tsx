import { notFound } from 'next/navigation'
import { ExternalLink, ArrowLeft, Calendar } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MainLayout from '@/app/components/MainLayout'
import { createStaticClient } from '@/app/lib/supabase/static'
import { createClient } from '@/app/lib/supabase/server'
import { getYouTubeEmbedUrl } from '@/app/lib/youtube-utils'
import type { Metadata } from 'next'
import type { YouTubeVideo } from '@/app/types'

export const revalidate = 60 // ISR: 60秒ごとに再生成
export const dynamicParams = true // 動的パラメータを許可
export const fetchCache = 'force-no-store' // キャッシュを無効化

// 静的パラメータを生成
export async function generateStaticParams() {
  try {
    const supabase = createStaticClient()
    const { data: videos } = await supabase
      .from('youtube_videos')
      .select('id')

    return videos?.map((video) => ({
      id: video.id,
    })) || []
  } catch (error) {
    console.error('Error in generateStaticParams:', error)
    return []
  }
}

// YouTube動画データを取得
async function getYouTubeVideo(id: string): Promise<YouTubeVideo | null> {
  const supabase = createStaticClient()
  const { data: video } = await supabase
    .from('youtube_videos')
    .select('*, enterprise_service, individual_service')
    .eq('id', id)
    .single()

  return video
}

// 関連動画を取得
async function getRelatedVideos(currentVideoId: string): Promise<YouTubeVideo[]> {
  const supabase = await createClient()
  const { data: relatedVideos } = await supabase
    .from('youtube_videos')
    .select('*')
    .neq('id', currentVideoId)
    .order('created_at', { ascending: false })
    .limit(3)

  return relatedVideos || []
}

// メタデータを生成
export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const video = await getYouTubeVideo(resolvedParams.id)

  if (!video) {
    return {
      title: 'AI駆動研究所',
      description: 'AI駆動研究所のYouTubeコンテンツ。',
    }
  }

  const baseUrl = 'https://www.landbridge.ai'
  const timestamp = Date.now()
  const imageUrl = `${video.thumbnail_url}?t=${timestamp}`

  const metadata: Metadata = {
    title: `${video.title} - AI駆動研究所`,
    description: video.description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/youtube-videos/${video.id}`,
    },
    openGraph: {
      title: video.title,
      description: video.description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: video.title,
          type: 'image/jpeg',
        }
      ],
      type: 'video.other',
      siteName: 'AI駆動研究所',
      url: `${baseUrl}/youtube-videos/${video.id}`,
      locale: 'ja_JP',
    },
    twitter: {
      card: 'summary_large_image',
      title: video.title,
      description: video.description,
      images: [imageUrl],
      creator: '@ai_driven_lab',
    },
    other: {
      'msapplication-TileImage': imageUrl,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }

  return metadata
}

// Next.js 15の新しい形式に対応
export default async function YouTubeVideoDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const video = await getYouTubeVideo(resolvedParams.id)

  if (!video) {
    notFound()
  }

  // 関連動画を取得
  const relatedVideos = await getRelatedVideos(video.id)

  return (
    <MainLayout
      dynamicSidebar={{
        enterpriseServiceId: video.enterprise_service,
        individualServiceId: video.individual_service
      }}
    >
      <div className="p-4 sm:p-6 pt-2 sm:pt-3">
        <Link
          href="/youtube-videos"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          YouTube一覧に戻る
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">{video.title}</h1>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Left column - YouTube Player */}
          <div className="lg:w-1/2">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={getYouTubeEmbedUrl(video.youtube_video_id)}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>

            {/* Action buttons below player */}
            <div className="mt-8 flex flex-col gap-3">
              <a
                href={video.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium w-full"
              >
                YouTubeで視聴する
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right column - Video details */}
          <div className="lg:w-1/2 space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-900">動画の説明</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{video.description}</p>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-600 mb-2">投稿日</h3>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4" />
                <span>{new Date(video.created_at).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>

            {video.featured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600 font-semibold">⭐ 注目動画</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 関連動画 */}
        {relatedVideos.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">関連動画</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedVideos.map((relatedVideo) => (
                <Link
                  key={relatedVideo.id}
                  href={`/youtube-videos/${relatedVideo.id}`}
                  className="group"
                >
                  <article className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    <div className="relative aspect-video">
                      <Image
                        src={relatedVideo.thumbnail_url}
                        alt={relatedVideo.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        unoptimized
                      />
                      {relatedVideo.featured && (
                        <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-3 py-1 rounded font-semibold">
                          注目
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {relatedVideo.title}
                      </h3>

                      <div className="flex-1">
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {relatedVideo.description || ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(relatedVideo.created_at).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  )
}
