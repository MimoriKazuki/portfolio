'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, PlayCircle, Lock, ArrowRight, Bookmark } from 'lucide-react'
import { ELearningContent, ELearningCategory } from '@/app/types'
import LoginPromptModal from './LoginPromptModal'

interface ELearningTopClientProps {
  featuredContents: ELearningContent[]
  categories: ELearningCategory[]
  contentsByCategory: Record<string, ELearningContent[]>
  isLoggedIn: boolean
  userBookmarks?: string[]
}

// コンテンツカードコンポーネント
function ContentCard({
  content,
  isLoggedIn,
  isBookmarked,
  onCardClick,
}: {
  content: ELearningContent
  isLoggedIn: boolean
  isBookmarked: boolean
  onCardClick: () => void
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault()
      onCardClick()
    }
  }

  return (
    <Link
      href={`/e-learning/${content.id}`}
      onClick={handleClick}
      className="group block h-full"
    >
      <article className="overflow-hidden border-2 border-transparent hover:border-gray-200 transition-colors duration-300 h-full flex flex-col p-4 rounded">
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
          {/* 無料バッジ */}
          {content.is_free && (
            <div className="absolute top-2 left-2 bg-white text-xs px-3 py-1 border border-green-200 text-green-700 font-medium">
              無料
            </div>
          )}
          {/* ブックマークアイコン */}
          {isBookmarked && (
            <div className="absolute top-2 right-2">
              <Bookmark className="h-5 w-5 text-yellow-500" fill="currentColor" />
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
        <div className="pt-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {content.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 flex-1">
            {content.description || ''}
          </p>
        </div>
      </article>
    </Link>
  )
}

export default function ELearningTopClient({
  featuredContents,
  categories,
  contentsByCategory,
  isLoggedIn,
  userBookmarks = [],
}: ELearningTopClientProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    if (!isLoggedIn) {
      setShowLoginModal(true)
    }
  }, [isLoggedIn])

  const handleCardClick = () => {
    setShowLoginModal(true)
  }

  return (
    <div className="w-full pt-8 max-mid:pt-0 min-h-screen">
      {/* ヘッダー */}
      <div
        className="mb-12"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Learning Videos</h1>
        <p className="text-lg text-gray-500">eラーニング</p>
      </div>

      {/* おすすめセクション */}
      {featuredContents.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">おすすめ</h2>
            <Link
              href="/e-learning/courses?category=featured"
              className="flex items-center gap-1 text-portfolio-blue hover:text-portfolio-blue-dark transition-colors text-sm font-medium"
            >
              もっと見る
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredContents.slice(0, 3).map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                isLoggedIn={isLoggedIn}
                isBookmarked={userBookmarks.includes(content.id)}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* カテゴリセクション */}
      {categories.map((category) => {
        const categoryContents = contentsByCategory[category.id] || []
        if (categoryContents.length === 0) return null

        return (
          <section key={category.id} className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
              <Link
                href={`/e-learning/courses?category=${category.slug}`}
                className="flex items-center gap-1 text-portfolio-blue hover:text-portfolio-blue-dark transition-colors text-sm font-medium"
              >
                もっと見る
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryContents.slice(0, 3).map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  isLoggedIn={isLoggedIn}
                  isBookmarked={userBookmarks.includes(content.id)}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          </section>
        )
      })}

      {/* すべてのコースへのリンク */}
      <div className="text-center py-8">
        <Link
          href="/e-learning/courses"
          className="inline-flex items-center gap-2 px-8 py-4 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white rounded-lg transition-colors font-medium"
        >
          すべてのコースを見る
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      {/* ログインモーダル */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}
