'use client'

import { ELearningContent } from '@/app/types'
import Image from 'next/image'
import Link from 'next/link'
import { Play, PlayCircle, Lock } from 'lucide-react'

interface ELearningCardProps {
  content: ELearningContent
  onCardClick: (contentId: string) => boolean
  isLoggedIn: boolean
}

export default function ELearningCard({ content, onCardClick, isLoggedIn }: ELearningCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault()
      onCardClick(content.id)
    }
  }

  return (
    <Link
      href={`/e-learning/${content.id}`}
      onClick={handleClick}
      className="group block h-full"
    >
      <article className="overflow-hidden border-2 border-transparent hover:border-gray-200 transition-colors duration-300 h-full flex flex-col p-4 rounded">
        {/* サムネイル */}
        <div className="relative aspect-video w-full bg-gray-200 overflow-hidden rounded">
          {content.thumbnail_url ? (
            <Image
              src={content.thumbnail_url}
              alt={content.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <PlayCircle className="h-12 w-12 text-white/80" />
            </div>
          )}
          {/* 注目バッジ（左上） */}
          {content.is_featured && (
            <div className="absolute top-2 left-2 bg-portfolio-blue text-white text-xs px-3 py-1 font-medium">
              注目
            </div>
          )}
          {/* 再生ボタンオーバーレイ */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-blue-600 rounded-full p-4">
              {isLoggedIn ? (
                <Play className="h-8 w-8 text-white fill-white" />
              ) : (
                <Lock className="h-8 w-8 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* テキスト群 */}
        <div className="pt-4 flex-1 flex flex-col">
          {/* タイトル */}
          <h2 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {content.title}
          </h2>

          {/* 説明文 */}
          <div className="flex-1">
            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
              {content.description || ''}
            </p>
          </div>

          {/* 公開日と無料バッジ */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {new Date(content.created_at).toLocaleDateString('ja-JP')}
            </span>
            {/* 無料コンテンツのみバッジ表示（有料がデフォルトであることを示唆） */}
            {content.is_free && (
              <span className="bg-white text-xs px-3 py-1 border border-green-200 text-green-700 font-medium">
                無料
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
