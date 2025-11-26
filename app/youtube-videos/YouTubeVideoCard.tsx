'use client'

import { YouTubeVideo } from '@/app/types'
import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import { formatDuration } from '@/app/lib/youtube-api'
import { formatDate } from '@/app/lib/date-utils'

interface YouTubeVideoCardProps {
  video: YouTubeVideo
}

export default function YouTubeVideoCard({ video }: YouTubeVideoCardProps) {
  return (
    <Link
      href={`/youtube-videos/${video.id}`}
      className="group block h-full"
    >
      <div className="overflow-hidden border-2 border-transparent hover:border-gray-200 transition-colors duration-300 h-full flex flex-col p-4 rounded">
        {/* サムネイル */}
        <div className="relative aspect-video w-full bg-gray-200 overflow-hidden rounded">
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* 再生時間（右下） */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 font-semibold">
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
        <div className="pt-4 flex flex-col flex-1">
          {/* タイトル */}
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
            {video.title}
          </h3>

          {/* チャンネル名 */}
          {video.channel_title && (
            <p className="text-sm text-gray-600 truncate mb-auto">
              {video.channel_title}
            </p>
          )}

          {/* 下部の情報（公開日・バッジ） */}
          <div className="flex items-center justify-between gap-2 mt-3">
            {/* 外部チャンネルはシステム登録日、自社チャンネルはYouTube公開日 */}
            <p className="text-xs text-gray-500">
              {!video.is_own_channel
                ? formatDate(video.created_at)
                : formatDate(video.published_at || video.created_at)}
            </p>
            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium whitespace-nowrap border ${
              video.is_own_channel
                ? 'border-blue-200 text-blue-700 bg-white'
                : 'border-green-200 text-green-700 bg-white'
            }`}>
              {video.is_own_channel ? '自社チャンネル' : '外部チャンネル'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
