'use client'

import { useState, useEffect } from 'react'
import { YouTubeVideo } from '@/app/types'
import { FolderOpen } from 'lucide-react'
import YouTubeVideoCard from './YouTubeVideoCard'

interface YouTubeVideosClientProps {
  videos: YouTubeVideo[]
}

export default function YouTubeVideosClient({ videos }: YouTubeVideosClientProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="w-full pt-8">
      <div
        className="mb-12"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">YOUTUBE</h1>
        <p className="text-lg text-gray-500">動画</p>
      </div>

      {/* カードコンテナ */}
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FolderOpen className="h-16 w-16 sm:h-24 sm:w-24 text-gray-400 mb-4" />
          <p className="text-lg sm:text-xl text-gray-500">動画はまだ投稿されていません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
