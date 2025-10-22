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

// URLをリンクに変換するヘルパー関数
function linkifyText(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
        >
          {part}
        </a>
      )
    }
    // プレーンテキストもspanでラップしてkeyを付与
    return <span key={index}>{part}</span>
  })
}

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

        {/* YouTube Player */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-4">
          <iframe
            src={getYouTubeEmbedUrl(video.youtube_video_id)}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Video Info */}
        <div className="space-y-4">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{video.title}</h1>

          {/* Channel info and action buttons row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-gray-200">
            {/* Left side - Channel info and metadata (2 lines) */}
            <div className="flex flex-col gap-2">
              {/* 1行目: チャンネル名、バッジ */}
              <div className="flex flex-wrap items-center gap-4">
                {/* チャンネル名 */}
                {video.channel_title && (
                  <span className="text-sm font-medium text-gray-900">{video.channel_title}</span>
                )}
                {/* バッジ（自社チャンネル・外部チャンネル） */}
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                  video.is_own_channel
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {video.is_own_channel ? '自社チャンネル' : '外部チャンネル'}
                </span>
                {/* 注目バッジ */}
                {video.featured && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                    ⭐ 注目
                  </span>
                )}
              </div>
              {/* 2行目: 公開日 */}
              <div className="text-sm text-gray-600">
                {video.published_at ? (
                  new Date(video.published_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }).replace(/\//g, '/')
                ) : (
                  new Date(video.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }).replace(/\//g, '/')
                )}に公開
              </div>
            </div>

            {/* Right side - YouTube button */}
            <div className="flex items-center gap-2">
              <a
                href={video.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all font-medium text-sm whitespace-nowrap"
              >
                <ExternalLink className="w-4 h-4" />
                YouTubeで視聴
              </a>
            </div>
          </div>

          {/* Description box - scrollable */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="max-h-80 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {linkifyText(video.description)}
              </p>
            </div>
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
                      {/* バッジを右上に統一 */}
                      {relatedVideo.is_own_channel && (
                        <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-semibold shadow-lg">
                          自社チャンネル
                        </div>
                      )}
                      {relatedVideo.featured && (
                        <div className={`absolute ${relatedVideo.is_own_channel ? 'top-12' : 'top-3'} right-3 bg-yellow-500 text-white text-xs px-3 py-1 rounded font-semibold`}>
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
