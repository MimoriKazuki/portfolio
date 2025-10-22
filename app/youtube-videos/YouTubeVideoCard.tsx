'use client'

import { YouTubeVideo } from '@/app/types'
import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'

interface YouTubeVideoCardProps {
  video: YouTubeVideo
}

export default function YouTubeVideoCard({ video }: YouTubeVideoCardProps) {
  return (
    <Link
      href={`/youtube-videos/${video.id}`}
      className="group block h-full"
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* サムネイル */}
        <div className="relative aspect-video w-full bg-gray-200 overflow-hidden">
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* 再生ボタンオーバーレイ */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-red-600 rounded-full p-4">
              <Play className="h-8 w-8 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {video.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3 flex-1">
            {video.description}
          </p>
        </div>
      </div>
    </Link>
  )
}
