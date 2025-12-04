'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { Play, PlayCircle, Lock, Bookmark } from 'lucide-react'
import { ELearningContent, ELearningCategory } from '@/app/types'
import LoginPromptModal from '../LoginPromptModal'

interface ELearningCoursesClientProps {
  contents: ELearningContent[]
  categories: ELearningCategory[]
  isLoggedIn: boolean
  userBookmarks: string[]
}

function CourseCard({
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

  // /e-learning/coursesから来たことを示すパラメータを追加
  return (
    <Link
      href={`/e-learning/${content.id}?from=courses`}
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
          {/* ブックマークアイコン（ブックマーク済みのみ表示） */}
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
          <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-1">
            {content.description || ''}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {new Date(content.created_at).toLocaleDateString('ja-JP')}
            </span>
            {content.category && (
              <span className="bg-white text-xs px-3 py-1 border border-gray-200 text-gray-700 font-medium">
                {content.category.name}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

export default function ELearningCoursesClient({
  contents,
  categories,
  isLoggedIn,
  userBookmarks: initialBookmarks,
}: ELearningCoursesClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'

  const [isVisible, setIsVisible] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [bookmarks] = useState<string[]>(initialBookmarks)

  useEffect(() => {
    setIsVisible(true)
    if (!isLoggedIn) {
      setShowLoginModal(true)
    }
  }, [isLoggedIn])

  // URLパラメータの変更を監視
  useEffect(() => {
    const category = searchParams.get('category') || 'all'
    setSelectedCategory(category)
  }, [searchParams])

  // フィルタリングされたコンテンツ
  const filteredContents = useMemo(() => {
    if (selectedCategory === 'all') {
      return contents
    }
    if (selectedCategory === 'featured') {
      return contents.filter(c => c.is_featured)
    }
    if (selectedCategory === 'bookmarks') {
      return contents.filter(c => bookmarks.includes(c.id))
    }
    return contents.filter(c => c.category?.slug === selectedCategory)
  }, [contents, selectedCategory, bookmarks])

  // カテゴリ変更（replaceで履歴を上書きし、戻るボタンで前のタブに戻らないようにする）
  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug)
    if (categorySlug === 'all') {
      router.replace('/e-learning/courses')
    } else {
      router.replace(`/e-learning/courses?category=${categorySlug}`)
    }
  }

  const handleCardClick = () => {
    setShowLoginModal(true)
  }

  return (
    <div className="w-full pt-8 max-mid:pt-0 min-h-screen">
      {/* ヘッダー */}
      <div
        className="mb-8"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Link href="/e-learning" className="text-gray-500 hover:text-gray-700">
            eラーニング
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">コース一覧</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Courses</h1>
        <p className="text-lg text-gray-500">コース一覧</p>
      </div>

      {/* タブ */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              selectedCategory === 'all'
                ? 'border-portfolio-blue text-portfolio-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => handleCategoryChange('featured')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              selectedCategory === 'featured'
                ? 'border-portfolio-blue text-portfolio-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            おすすめ
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.slug)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                selectedCategory === category.slug
                  ? 'border-portfolio-blue text-portfolio-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
          {isLoggedIn && (
            <button
              onClick={() => handleCategoryChange('bookmarks')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1 ${
                selectedCategory === 'bookmarks'
                  ? 'border-portfolio-blue text-portfolio-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bookmark className="h-4 w-4" />
              ブックマーク
            </button>
          )}
        </div>
      </div>

      {/* コンテンツグリッド */}
      {filteredContents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-gray-500">
            {selectedCategory === 'bookmarks'
              ? 'ブックマークしたコースはありません'
              : selectedCategory === 'featured'
              ? 'おすすめのコースはありません'
              : 'コンテンツは準備中です'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredContents.map((content) => (
            <CourseCard
              key={content.id}
              content={content}
              isLoggedIn={isLoggedIn}
              isBookmarked={bookmarks.includes(content.id)}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      )}

      {/* ログインモーダル */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}
