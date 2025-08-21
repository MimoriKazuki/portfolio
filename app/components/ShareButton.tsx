'use client'

import { Share2 } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonProps {
  url: string
  title: string
}

export default function ShareButton({ url, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  
  const handleShare = async () => {
    // Teamsキャッシュ回避のためのタイムスタンプ追加
    const timestamp = Math.floor(Date.now() / 1000)
    const shareUrl = `${url}?t=${timestamp}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Web Share APIが使えない場合はクリップボードにコピー
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
    >
      <Share2 className="w-4 h-4" />
      {copied ? 'コピーしました！' : '共有'}
    </button>
  )
}