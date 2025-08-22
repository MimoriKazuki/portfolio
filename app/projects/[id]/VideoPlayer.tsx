'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'

interface VideoPlayerProps {
  thumbnail: string
  videoUrl: string
  title: string
}

export default function VideoPlayer({ thumbnail, videoUrl, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Extract video ID from YouTube URL
  const getYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  // Check if it's a YouTube URL
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
  const youTubeId = isYouTube ? getYouTubeId(videoUrl) : null

  return (
    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
      {!isPlaying ? (
        <>
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 896px"
            priority
          />
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
            aria-label="動画を再生"
          >
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-10 h-10 text-gray-900 ml-1" fill="currentColor" />
            </div>
          </button>
        </>
      ) : (
        <>
          {isYouTube && youTubeId ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1&rel=0`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              className="absolute inset-0 w-full h-full"
              controls
              autoPlay
              src={videoUrl}
            >
              お使いのブラウザは動画再生に対応していません。
            </video>
          )}
        </>
      )}
    </div>
  )
}