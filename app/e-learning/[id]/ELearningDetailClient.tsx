'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ELearningContent } from '@/app/types'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  PlayCircle,
  Download,
  Lock,
  Play,
  Bookmark
} from 'lucide-react'
import { createClient } from '@/app/lib/supabase/client'
import PurchasePromptModal from '../PurchasePromptModal'

interface ELearningDetailClientProps {
  content: ELearningContent
  user: User
  hasPurchased: boolean
  relatedContents?: ELearningContent[]
  initialBookmarked?: boolean
}

// YouTube動画IDを抽出
const getYouTubeId = (url: string) => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([^&\n?#]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Google Drive埋め込みURLを取得
const getGoogleDriveEmbedUrl = (url: string) => {
  const regex = /\/file\/d\/([a-zA-Z0-9_-]+)/
  const match = url.match(regex)
  if (match) {
    const fileId = match[1]
    return `https://drive.google.com/file/d/${fileId}/preview`
  }
  return null
}

export default function ELearningDetailClient({
  content,
  user,
  hasPurchased,
  relatedContents = [],
  initialBookmarked = false
}: ELearningDetailClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false)
  const supabase = createClient()

  // 有料コンテンツで未購入の場合、初期表示でモーダルを表示
  const initialShowModal = !hasPurchased && !content.is_free
  const [showPurchaseModal, setShowPurchaseModal] = useState(initialShowModal)
  // 初期表示でモーダルが開かれたかどうか（閉じる時の挙動を変えるため）
  const [isInitialModal, setIsInitialModal] = useState(initialShowModal)

  // 戻り先URL（from=coursesの場合は/e-learning/courses、それ以外は/e-learning）
  const returnUrl = searchParams.get('from') === 'courses' ? '/e-learning/courses' : '/e-learning'

  // 購入モーダルを閉じる処理
  const handleClosePurchaseModal = () => {
    if (isInitialModal) {
      // 初期表示のモーダルを閉じる場合は前の画面に戻る
      router.back()
    } else {
      // ページ内から開いたモーダルは単に閉じる
      setShowPurchaseModal(false)
    }
  }

  // ブックマーク切り替え
  const handleBookmarkToggle = async () => {
    setIsBookmarkLoading(true)
    console.log('[Bookmark] Toggle start:', { userId: user.id, contentId: content.id, currentState: isBookmarked })
    try {
      if (isBookmarked) {
        // ブックマーク削除
        const { error, data } = await supabase
          .from('e_learning_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', content.id)
          .select()

        console.log('[Bookmark] Delete result:', { error, data })
        if (error) throw error
        setIsBookmarked(false)
      } else {
        // ブックマーク追加
        const { error, data } = await supabase
          .from('e_learning_bookmarks')
          .insert({ user_id: user.id, content_id: content.id })
          .select()

        console.log('[Bookmark] Insert result:', { error, data })
        if (error) throw error
        setIsBookmarked(true)
      }
    } catch (error) {
      console.error('[Bookmark] Error toggling bookmark:', error)
    } finally {
      setIsBookmarkLoading(false)
    }
  }

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // 動画タイプを判定
  const isYouTube = content.video_url?.includes('youtube.com') || content.video_url?.includes('youtu.be')
  const isGoogleDrive = content.video_url?.includes('drive.google.com')

  const youTubeId = isYouTube ? getYouTubeId(content.video_url) : null
  const googleDriveEmbedUrl = isGoogleDrive ? getGoogleDriveEmbedUrl(content.video_url) : null

  // 資料をdisplay_order順にソート
  const sortedMaterials = content.materials
    ? [...content.materials].sort((a, b) => a.display_order - b.display_order)
    : []

  return (
    <div className="p-4 sm:p-6 pt-2 sm:pt-3 xl:min-h-[calc(100vh-64px)]">
      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}
      >
        {/* 戻るリンク */}
        <Link
          href={returnUrl}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          eラーニング一覧に戻る
        </Link>

        {/* 動画プレイヤー */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-4">
          {hasPurchased ? (
            !isPlaying ? (
              <>
                {content.thumbnail_url && (
                  <Image
                    src={content.thumbnail_url}
                    alt={content.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 896px"
                    priority
                  />
                )}
                <button
                  onClick={async () => {
                    setIsLoading(true)
                    // 閲覧数をカウント
                    try {
                      await fetch('/api/e-learning/view', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contentId: content.id })
                      })
                    } catch (error) {
                      console.error('Failed to track view:', error)
                    }
                    setTimeout(() => {
                      setIsPlaying(true)
                      setIsLoading(false)
                    }, 500)
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                  aria-label="動画を再生"
                >
                  {isLoading ? (
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-gray-900 ml-1" fill="currentColor" />
                    </div>
                  )}
                </button>
              </>
            ) : (
              <>
                {isYouTube && youTubeId ? (
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1&rel=0`}
                    title={content.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : isGoogleDrive && googleDriveEmbedUrl ? (
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={googleDriveEmbedUrl}
                    title={content.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <video
                    className="absolute inset-0 w-full h-full"
                    controls
                    autoPlay
                    src={content.video_url}
                  >
                    お使いのブラウザは動画再生に対応していません。
                  </video>
                )}
              </>
            )
          ) : (
            // 未購入時はサムネイルのみ表示（モーダルで購入を促す）
            <>
              {content.thumbnail_url && (
                <Image
                  src={content.thumbnail_url}
                  alt={content.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 896px"
                  priority
                />
              )}
              <div className="absolute inset-0 bg-black/40" />
            </>
          )}
        </div>

        {/* Video Info */}
        <div className="space-y-4">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{content.title}</h1>

          {/* メタ情報とダウンロードボタン */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-gray-200">
            {/* 左側 - メタ情報 */}
            <div className="flex flex-col gap-2">
              {/* カテゴリバッジ・無料バッジ */}
              <div className="flex flex-wrap items-center gap-2">
                {content.category && (
                  <span className="bg-white text-xs px-3 py-1 border border-gray-200 text-gray-700 font-medium">
                    {content.category.name}
                  </span>
                )}
                {content.is_free && (
                  <span className="bg-white text-xs px-3 py-1 border border-green-200 text-green-700 font-medium">
                    無料
                  </span>
                )}
              </div>
            </div>

            {/* 右側 - ブックマーク・ダウンロードボタン */}
            <div className="flex items-center gap-3">
              {/* ブックマークボタン */}
              <button
                onClick={handleBookmarkToggle}
                disabled={isBookmarkLoading}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full transition-all font-medium text-sm whitespace-nowrap border ${
                  isBookmarked
                    ? 'bg-yellow-50 border-yellow-300 text-yellow-600 hover:bg-yellow-100'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                } ${isBookmarkLoading ? 'opacity-50 cursor-wait' : ''}`}
              >
                <Bookmark
                  className="w-4 h-4"
                  fill={isBookmarked ? 'currentColor' : 'none'}
                />
                ブックマーク
              </button>

              {/* ダウンロードボタン */}
              {sortedMaterials.length > 0 && (
                <>
                  {hasPurchased ? (
                    <div className="flex flex-col gap-2">
                      {sortedMaterials.map((material, index) => (
                        <a
                          key={material.id}
                          href={material.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all font-medium text-sm whitespace-nowrap"
                        >
                          <Download className="w-4 h-4" />
                          資料ダウンロード{sortedMaterials.length > 1 ? ` (${index + 1})` : ''}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-300 text-gray-500 rounded-full font-medium text-sm whitespace-nowrap cursor-not-allowed">
                      <Lock className="w-4 h-4" />
                      資料ダウンロード
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Description box - scrollable */}
          {content.description && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="max-h-80 overflow-y-auto">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {content.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 関連コンテンツ */}
        {relatedContents.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">関連動画</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {relatedContents.map((relatedContent) => (
                <Link
                  key={relatedContent.id}
                  href={`/e-learning/${relatedContent.id}`}
                  className="group"
                >
                  <article className="border-2 border-transparent hover:border-gray-200 rounded p-4 transition-colors duration-300 h-full flex flex-col">
                    <div className="relative aspect-video overflow-hidden rounded">
                      {relatedContent.thumbnail_url ? (
                        <Image
                          src={relatedContent.thumbnail_url}
                          alt={relatedContent.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                          <PlayCircle className="h-10 w-10 text-white/80" />
                        </div>
                      )}
                      <div className={`absolute top-2 left-2 px-3 py-1 text-xs font-medium bg-white border ${
                        relatedContent.is_free
                          ? 'border-green-200 text-green-700'
                          : 'border-orange-200 text-orange-700'
                      }`}>
                        {relatedContent.is_free ? '無料' : '有料'}
                      </div>
                    </div>

                    <div className="pt-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {relatedContent.title}
                      </h3>

                      {relatedContent.description && (
                        <div className="flex-1">
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {relatedContent.description}
                          </p>
                        </div>
                      )}

                      {relatedContent.category && (
                        <div className="text-xs text-gray-500">
                          {relatedContent.category.name}
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 購入促進モーダル */}
      <PurchasePromptModal
        isOpen={showPurchaseModal}
        onClose={handleClosePurchaseModal}
        contentId={content.id}
        cancelReturnUrl={returnUrl}
      />
    </div>
  )
}
