'use client'

import { YouTubeVideo } from '@/app/types'
import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import { formatDuration } from '@/app/lib/youtube-api'

interface YouTubeVideoCardProps {
  video: YouTubeVideo
}

export default function YouTubeVideoCard({ video }: YouTubeVideoCardProps) {
  return (
    <Link
      href={`/youtube-videos/${video.id}`}
      className="group block h-full"
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* サムネイル */}
        <div className="relative aspect-video w-full bg-gray-200 overflow-hidden">
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* 再生時間（右下） */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
              {formatDuration(video.duration)}
            </div>
          )}
          {/* 再生ボタンオーバーレイ */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-red-600 rounded-full p-4">
              <Play className="h-8 w-8 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-4 flex flex-col flex-1">
          {/* タイトル */}
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {video.title}
          </h3>

          {/* 下部の情報（チャンネル名・公開日・バッジ） */}
          <div className="mt-auto pt-2 flex flex-col gap-2">
            {/* チャンネル名 */}
            {video.channel_title && (
              <p className="text-sm text-gray-600 truncate">
                {video.channel_title}
              </p>
            )}
            {/* 公開日と自社チャンネルバッジ */}
            <div className="flex items-center justify-between gap-2">
              {/* 外部チャンネルはシステム登録日、自社チャンネルはYouTube公開日 */}
              {!video.is_own_channel ? (
                <p className="text-xs text-gray-500">
                  {new Date(video.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </p>
              ) : video.published_at ? (
                <p className="text-xs text-gray-500">
                  {new Date(video.published_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </p>
              ) : null}
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-auto ${
                video.is_own_channel
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {video.is_own_channel ? '自社チャンネル' : '外部チャンネル'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
