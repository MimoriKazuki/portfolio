'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Headphones } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl: string
}

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [playerOffset, setPlayerOffset] = useState({ left: 0, centerX: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updatePosition = () => {
      setIsMobile(window.innerWidth < 768)
      if (playerRef.current && !isFixed) {
        const rect = playerRef.current.getBoundingClientRect()
        setPlayerOffset({
          left: rect.left,
          centerX: rect.left + rect.width / 2
        })
      }
    }

    const handleScroll = () => {
      if (placeholderRef.current) {
        const rect = placeholderRef.current.getBoundingClientRect()
        // SP画面では80px（ヘッダー高さ + 16px余白）、PC画面では32pxで追従開始
        const threshold = window.innerWidth < 768 ? 80 : 32
        setIsFixed(rect.top <= threshold)
      }
    }

    // 初期位置を記録
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isFixed])

  // 音声の時間データを管理する別のuseEffect
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setDuration(audio.duration)
      setCurrentTime(audio.currentTime)
    }

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime)
    }

    // 音声データがロードされたとき
    audio.addEventListener('loadedmetadata', setAudioData)
    audio.addEventListener('loadeddata', setAudioData)
    audio.addEventListener('timeupdate', setAudioTime)
    
    // 既にロード済みの場合
    if (audio.readyState >= 2) {
      setAudioData()
    }

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData)
      audio.removeEventListener('loadeddata', setAudioData)
      audio.removeEventListener('timeupdate', setAudioTime)
    }
  }, [audioUrl])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = Number(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* プレースホルダー要素 */}
      <div ref={placeholderRef} style={isFixed ? { height: playerRef.current?.offsetHeight || 0 } : undefined} />
      
      {/* プレイヤー本体 */}
      <div
        ref={playerRef}
        className={`bg-white rounded-full shadow-lg px-4 py-3 md:px-5 md:py-3.5 border border-gray-200 inline-block overflow-hidden ${
          isFixed ? 'fixed top-20 md:top-8 z-30' : 'relative z-10'
        }`}
        style={isFixed ? {
          left: isMobile ? '50%' : `${playerOffset.centerX}px`,
          transform: isMobile || !isFixed ? 'translateX(-50%)' : 'translateX(-50%)'
        } : undefined}
      >
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
        />
        
        <div className="flex items-center relative">
          {/* 再生前の表示 */}
          <div className={`flex items-center gap-3 transition-all duration-300 ease-in-out ${
            isPlaying ? 'opacity-0 invisible absolute' : 'opacity-100 visible'
          }`}>
            <Headphones className="h-5 w-5 text-portfolio-blue flex-shrink-0" />
            <span className="font-medium text-gray-900 text-sm md:text-base whitespace-nowrap">ラジオ解説</span>
          </div>

          {/* 再生/停止ボタン */}
          <button
            onClick={togglePlayPause}
            className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white rounded-full flex-shrink-0 ${
              isPlaying ? '' : 'ml-3'
            }`}
            style={{
              transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            aria-label={isPlaying ? '一時停止' : '再生'}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <Play className="h-4 w-4 md:h-5 md:w-5 ml-0.5" />
            )}
          </button>

          {/* 再生中のシークバー */}
          <div className={`flex items-center gap-2 ${
            isPlaying ? 'opacity-100 w-auto ml-3' : 'opacity-0 w-0'
          }`} style={{ 
            overflow: 'hidden',
            transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSliderChange}
              className="w-24 md:w-32 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #003B70 0%, #003B70 ${(currentTime / (duration || 1)) * 100}%, #E5E7EB ${(currentTime / (duration || 1)) * 100}%, #E5E7EB 100%)`
              }}
            />
            <span className="text-xs text-gray-500 whitespace-nowrap pr-1">
              {formatTime(currentTime)}/{formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}