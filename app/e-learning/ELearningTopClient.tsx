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

      {/* 説明セクション */}
      <section
        className="mt-16 mb-16"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* 左側: タイトル */}
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed tracking-tight">
              実践的なAIスキルを、<br />
              いつでもどこでも学べる。
            </h2>
          </div>

          {/* 右側: 説明文 */}
          <div className="flex flex-col">
            <p className="text-gray-600 leading-loose mb-6">
              AI駆動研究所のeラーニングでは、生成AIを活用した実践的なスキルを動画で学ぶことができます。基礎から応用まで、体系的なカリキュラムで効率的に学習を進められます。
            </p>
            <p className="text-gray-600 leading-loose mb-8">
              プロンプトエンジニアリング、AIライティング、AI動画制作など、今すぐ仕事に活かせるスキルを、経験豊富な講師陣がわかりやすく解説します。
            </p>

            {/* すべてのコンテンツを見るボタン */}
            <div className="flex justify-end">
              <Link
                href="/e-learning/courses"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 border border-blue-600 font-light hover:bg-blue-50 transition-colors duration-200 text-base"
              >
                すべてのコンテンツを見る
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* おすすめセクション */}
      {featuredContents.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold md:text-3xl tracking-tight">おすすめ</h2>
            <Link
              href="/e-learning/courses?category=featured"
              className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >
              <span className="tracking-wider">VIEW ALL</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 mid:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredContents.slice(0, 3).map((content, index) => (
              <div key={content.id} className={index >= 2 ? 'mid:hidden lg:block' : ''}>
                <ContentCard
                  content={content}
                  isLoggedIn={isLoggedIn}
                  isBookmarked={userBookmarks.includes(content.id)}
                  onCardClick={handleCardClick}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* カテゴリセクション */}
      {categories.map((category) => {
        const categoryContents = contentsByCategory[category.id] || []
        if (categoryContents.length === 0) return null

        return (
          <section key={category.id} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold md:text-3xl tracking-tight">{category.name}</h2>
              <Link
                href={`/e-learning/courses?category=${category.slug}`}
                className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm"
              >
                <span className="tracking-wider">VIEW ALL</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 mid:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryContents.slice(0, 3).map((content, index) => (
                <div key={content.id} className={index >= 2 ? 'mid:hidden lg:block' : ''}>
                  <ContentCard
                    content={content}
                    isLoggedIn={isLoggedIn}
                    isBookmarked={userBookmarks.includes(content.id)}
                    onCardClick={handleCardClick}
                  />
                </div>
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
