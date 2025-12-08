'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, PlayCircle, Lock, ArrowRight, Bookmark } from 'lucide-react'
import { ELearningContent, ELearningCategory } from '@/app/types'
import LoginPromptModal from './LoginPromptModal'
import PurchasePromptModal from './PurchasePromptModal'

interface ELearningTopClientProps {
  featuredContents: ELearningContent[]
  categories: ELearningCategory[]
  contentsByCategory: Record<string, ELearningContent[]>
  isLoggedIn: boolean
  userBookmarks?: string[]
  hasPaidAccess?: boolean
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
  hasPaidAccess = false,
}: ELearningTopClientProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)

  // 無料ログインユーザーかどうか（ログイン済みで未購入）
  const isFreeUser = isLoggedIn && !hasPaidAccess

  useEffect(() => {
    setIsVisible(true)
    if (!isLoggedIn) {
      setShowLoginModal(true)
    }
  }, [isLoggedIn])

  const handleCardClick = () => {
    setShowLoginModal(true)
  }

  const handlePurchaseBannerClick = () => {
    setShowPurchaseModal(true)
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
        {/* 1461px以上では最大幅912pxで中央寄せ、位置関係は固定 */}
        <div className="textwide:max-w-[912px] textwide:mx-auto">
          {/* タイトル（左揃え） */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed tracking-tight">
              AI駆動開発スキルを、<br />
              いつでもどこでも学べる。
            </h2>
          </div>

          {/* 説明文（左余白が滑らかに増加、1461px以上では192px固定） */}
          <div className="pl-[clamp(0px,calc((100vw-720px)*0.34),192px)] textwide:!pl-[192px] mb-16">
            <div className="max-w-[720px]">
              <p className="text-gray-600 leading-loose mb-6">
                AI駆動開発に必要な知識を、基礎から応用まで体系的に学べる動画コンテンツを用意しています。実際の開発現場で使える実践的なスキルを、効率よく習得できます。
              </p>
              <p className="text-gray-600 leading-loose">
                書籍や断片的な情報を集める手間なく、AI駆動開発に必要なエッセンスを凝縮。すぐに仕事に活かせる知識を、わかりやすく解説しています。
              </p>
            </div>
          </div>

          {/* すべてのコンテンツを見るボタン（中央揃え） */}
          <div className="flex justify-center">
            <Link
              href="/e-learning/courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 border border-blue-600 font-light hover:bg-blue-50 transition-colors duration-200 text-base"
            >
              すべてのコンテンツを見る
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 無料ユーザー向け購入促進バナー（大） */}
      {isFreeUser && (
        <section className="mb-12 flex justify-center">
          <button
            onClick={handlePurchaseBannerClick}
            className="block w-full max-w-[800px] transition-opacity hover:opacity-80 duration-200"
          >
            <Image
              src="/images/banner/banner_lg.svg"
              alt="有料コンテンツ見放題 - 今だけ半額！"
              width={800}
              height={300}
              className="w-full h-auto"
              priority
            />
          </button>
        </section>
      )}

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

      {/* すべてのコンテンツへのリンク */}
      <div className="flex justify-center py-8">
        <Link
          href="/e-learning/courses"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 border border-blue-600 font-light hover:bg-blue-50 transition-colors duration-200 text-base"
        >
          すべてのコンテンツを見る
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* ログインモーダル */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* 購入モーダル */}
      <PurchasePromptModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        contentId="all-access"
      />
    </div>
  )
}
