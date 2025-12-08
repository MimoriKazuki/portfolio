'use client'

import { useState, useEffect, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { ChevronRight, Mail, FileText } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useELearningRelease } from '@/app/contexts/ELearningReleaseContext'
import PurchasePromptModal from '@/app/e-learning/PurchasePromptModal'

interface FixedBottomElementsProps {
  hideContactButton?: boolean
}

export default function FixedBottomElements({ hideContactButton = false }: FixedBottomElementsProps) {
  const pathname = usePathname()
  const bannerRef = useRef<HTMLDivElement>(null)
  const [bannerHeight, setBannerHeight] = useState(0)
  const [user, setUser] = useState<User | null>(null)
  const [hasPaidAccess, setHasPaidAccess] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [showFloating, setShowFloating] = useState(false)
  const [showBannerAnim, setShowBannerAnim] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const { handleELearningClick } = useELearningRelease()

  // 認証状態と有料アクセス状態の取得（APIルート経由）
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user')
        const data = await response.json()
        setUser(data.user)
        setHasPaidAccess(data.hasPaidAccess ?? false)
        setAuthChecked(true)
      } catch (e) {
        console.error('[FixedBottomElements] Auth check error:', e)
        setAuthChecked(true)
      }
    }
    checkAuth()
  }, [])

  // フローティングボタンのアニメーション用タイマー
  useEffect(() => {
    // メインコンテンツ表示後にフローティングボタンを表示（500ms後）
    const floatingTimer = setTimeout(() => {
      setShowFloating(true)
    }, 500)

    return () => {
      clearTimeout(floatingTimer)
    }
  }, [])

  // バナーアニメーション用タイマー（認証チェック完了後に開始）
  useEffect(() => {
    if (!authChecked) return

    // 認証チェック完了後、少し遅延してバナーをスライドイン
    const bannerTimer = setTimeout(() => {
      setShowBannerAnim(true)
    }, 300)

    return () => {
      clearTimeout(bannerTimer)
    }
  }, [authChecked])

  // バナー表示条件
  const isElearningPage = pathname.startsWith('/e-learning')
  // ログインバナーはeラーニングページでは非表示（モーダルがあるため）
  const showLoginBanner = authChecked && !user && !isElearningPage
  // 購入促進バナーはeラーニングページでも表示
  const showPurchaseBanner = authChecked && user && !hasPaidAccess
  const showBanner = showLoginBanner || showPurchaseBanner

  // バナーの高さを測定（アニメーション前に測定完了）
  useEffect(() => {
    // バナーが表示される場合は高さを事前に設定（デフォルト値）
    if (showBanner) {
      // 実際の高さを測定、またはデフォルト値を使用
      if (bannerRef.current) {
        setBannerHeight(bannerRef.current.offsetHeight)
      } else {
        // デフォルトの高さ（py-3 * 2 + text height）
        setBannerHeight(70)
      }
    } else {
      setBannerHeight(0)
    }
  }, [showBanner])

  // バナーがレンダリングされた後に正確な高さを再測定
  useEffect(() => {
    if (bannerRef.current && showBanner) {
      const height = bannerRef.current.offsetHeight
      if (height > 0) {
        setBannerHeight(height)
      }
    }
  }, [showBanner, showBannerAnim])

  // フローティングボタンの表示条件
  const isTopPage = pathname === '/'
  const isContactPage = pathname === '/contact'
  const isDocumentPage = pathname.startsWith('/documents')
  const showFloatingButtons = !isTopPage && !hideContactButton
  const hideContactBtn = isContactPage
  const hideDocumentBtn = isDocumentPage

  // 両方非表示の場合
  if (!showBanner && (!showFloatingButtons || (hideContactBtn && hideDocumentBtn))) {
    return null
  }

  // フローティングボタンの bottom 位置（バナー高さ + 16px余白）
  const floatingBottom = showBanner ? bannerHeight + 16 : 24

  return (
    <>
      {/* フローティングCTAボタン */}
      {showFloatingButtons && !(hideContactBtn && hideDocumentBtn) && (
        <div
          className={`fixed right-4 md:right-6 z-30 flex gap-3 transition-all duration-500 ease-out ${
            showFloating
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
          style={{ bottom: `${floatingBottom}px` }}
        >
          {/* 資料請求ボタン */}
          {!hideDocumentBtn && (
            <Link
              href="/documents"
              className="relative bg-gray-700 hover:bg-gray-800 text-white px-5 md:px-6 py-3 md:py-4 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2 md:gap-3"
            >
              <FileText className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base whitespace-nowrap">資料請求</span>
            </Link>
          )}

          {/* お問い合わせボタン */}
          {!hideContactBtn && (
            <Link
              href="/contact"
              className="relative bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white px-5 md:px-6 py-3 md:py-4 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2 md:gap-3 overflow-visible"
            >
              {/* Ripple animations */}
              <span className="absolute inset-0 rounded-full bg-[rgb(37,99,235)] animate-ripple"></span>
              <span className="absolute inset-0 rounded-full bg-[rgb(37,99,235)] animate-ripple" style={{ animationDelay: '2.5s' }}></span>

              <Mail className="h-4 w-4 md:h-5 md:w-5 relative z-10" />
              <span className="text-sm md:text-base relative z-10 whitespace-nowrap">お問い合わせ</span>
            </Link>
          )}
        </div>
      )}

      {/* ログインバナー（未ログイン時） */}
      {showLoginBanner && (
        <div
          ref={bannerRef}
          className={`fixed bottom-0 left-0 xl:left-[178px] right-0 z-30 transition-all duration-500 ease-out ${
            showBannerAnim
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-full'
          }`}
        >
          <Link
            href="/e-learning"
            onClick={handleELearningClick}
            className="block w-full bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-center py-3 gap-1">
                <p className="text-white text-xs sm:text-base font-semibold text-center">
                  AI駆動開発特化型のeラーニングサービスを開始しました。
                </p>
                <p className="text-white text-xs sm:text-base font-semibold text-center flex items-center gap-1">
                  無料ログインでまずはお試し
                  <ChevronRight className="h-4 w-4" />
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* 購入促進バナー（ログイン済み・未決済時） */}
      {showPurchaseBanner && (
        <div
          ref={bannerRef}
          className={`fixed bottom-0 left-0 xl:left-[178px] right-0 z-30 transition-all duration-500 ease-out ${
            showBannerAnim
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-full'
          }`}
        >
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="block w-full bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center py-3 gap-3 sm:gap-4">
                {/* 50%OFF バッジ（SVG） */}
                <img
                  src="/images/banner/banner_sm.svg"
                  alt="今だけ！有料動画コンテンツ 50%OFF"
                  className="h-[36px] sm:h-[52px] flex-shrink-0"
                />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-white text-xs sm:text-base font-semibold text-center">
                    全ての有料コンテンツが見放題！
                  </p>
                  <p className="text-white text-xs sm:text-base font-semibold text-center flex items-center gap-1">
                    今すぐ購入する
                    <ChevronRight className="h-4 w-4" />
                  </p>
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* 購入モーダル */}
      <PurchasePromptModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        contentId="all-access"
        cancelReturnUrl={pathname}
      />
    </>
  )
}
