'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { ChevronRight, Mail, FileText } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface FixedBottomElementsProps {
  hideContactButton?: boolean
}

export default function FixedBottomElements({ hideContactButton = false }: FixedBottomElementsProps) {
  const pathname = usePathname()
  const bannerRef = useRef<HTMLDivElement>(null)
  const [bannerHeight, setBannerHeight] = useState(0)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFloating, setShowFloating] = useState(false)
  const [showBannerAnim, setShowBannerAnim] = useState(false)

  // 認証状態の取得
  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // アニメーション用タイマー
  useEffect(() => {
    // メインコンテンツ表示後にフローティングボタンを表示（500ms後）
    const floatingTimer = setTimeout(() => {
      setShowFloating(true)
    }, 500)

    // フローティングボタン後にバナーを表示（800ms後）
    const bannerTimer = setTimeout(() => {
      setShowBannerAnim(true)
    }, 800)

    return () => {
      clearTimeout(floatingTimer)
      clearTimeout(bannerTimer)
    }
  }, [])

  // バナーの高さを測定（アニメーション前に測定完了）
  useEffect(() => {
    // バナーが表示される場合は高さを事前に設定（デフォルト値）
    if (!loading && !user) {
      // 実際の高さを測定、またはデフォルト値を使用
      if (bannerRef.current) {
        setBannerHeight(bannerRef.current.offsetHeight)
      } else {
        // デフォルトの高さ（py-3 * 2 + text height）
        setBannerHeight(70)
      }
    }
  }, [loading, user])

  // バナーがレンダリングされた後に正確な高さを再測定
  useEffect(() => {
    if (bannerRef.current && !loading && !user) {
      const height = bannerRef.current.offsetHeight
      if (height > 0) {
        setBannerHeight(height)
      }
    }
  }, [loading, user, showBannerAnim])

  // バナー表示条件
  const showBanner = !loading && !user

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

      {/* ログインバナー */}
      {showBanner && (
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
            className="block w-full bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-center py-3 gap-1">
                <p className="text-white text-sm sm:text-base font-semibold text-center">
                  AI駆動開発特化型のeラーニングサービスを開始しました。
                </p>
                <p className="text-white text-sm sm:text-base font-semibold text-center flex items-center gap-1">
                  無料ログインでまずはお試し
                  <ChevronRight className="h-4 w-4" />
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}
    </>
  )
}
