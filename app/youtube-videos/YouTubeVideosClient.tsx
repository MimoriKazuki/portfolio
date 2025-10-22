'use client'

import { YouTubeVideo } from '@/app/types'
import { FolderOpen } from 'lucide-react'
import YouTubeVideoCard from './YouTubeVideoCard'

interface YouTubeVideosClientProps {
  videos: YouTubeVideo[]
}

export default function YouTubeVideosClient({ videos }: YouTubeVideosClientProps) {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-gray-900">YouTube動画</h1>
      </div>

      {/* カードコンテナ */}
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FolderOpen className="h-16 w-16 sm:h-24 sm:w-24 text-gray-400 mb-4" />
          <p className="text-lg sm:text-xl text-gray-500">動画はまだ投稿されていません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {videos.map((video) => (
            <div key={video.id}>
              <YouTubeVideoCard video={video} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
