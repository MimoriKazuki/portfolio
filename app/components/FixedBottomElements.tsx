'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { ChevronRight, Mail, FileText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
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
  const [paidAccessChecked, setPaidAccessChecked] = useState(false)
  const [showFloating, setShowFloating] = useState(false)
  const [showBannerAnim, setShowBannerAnim] = useState(false)
  const [showPurchaseBannerAnim, setShowPurchaseBannerAnim] = useState(false)
  const [hasPaidAccess, setHasPaidAccess] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const { handleELearningClick } = useELearningRelease()

  // 最初からバナーを表示可能に（loading状態なし）
  useEffect(() => {
    let isMounted = true
    let supabase: ReturnType<typeof createClient>

    try {
      supabase = createClient()
    } catch (e) {
      console.error('[FixedBottomElements] Failed to create Supabase client:', e)
      setPaidAccessChecked(true)
      return
    }

    // 購入状態を取得するヘルパー関数
    const fetchPaidAccess = async (userId: string): Promise<boolean> => {
      try {
        const { data: eLearningUser } = await supabase
          .from('e_learning_users')
          .select('has_paid_access')
          .eq('auth_user_id', userId)
          .maybeSingle()
        return eLearningUser?.has_paid_access ?? false
      } catch {
        return false
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      setUser(session?.user ?? null)

      // ユーザーがログイン済みの場合、購入状態を確認
      if (session?.user) {
        const paidAccess = await fetchPaidAccess(session.user.id)
        if (isMounted) {
          setHasPaidAccess(paidAccess)
        }
      } else {
        setHasPaidAccess(false)
      }
      setPaidAccessChecked(true)
    })

    return () => {
      isMounted = false
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

  // 無料ログインユーザーかどうか（ログイン済みで未購入、購入状態チェック済み）
  const isFreeUser = paidAccessChecked && user && !hasPaidAccess

  // 購入促進バナーのアニメーション（isFreeUserが確定してから遅延表示）
  useEffect(() => {
    if (isFreeUser) {
      // 少し遅延させてから下から滑らかに表示（認証チェック後なので短めに）
      const timer = setTimeout(() => {
        setShowPurchaseBannerAnim(true)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setShowPurchaseBannerAnim(false)
    }
  }, [isFreeUser])

  // バナーの高さを測定（アニメーション前に測定完了）
  useEffect(() => {
    // バナーが表示される場合は高さを事前に設定（デフォルト値）
    if (!user || isFreeUser) {
      // 実際の高さを測定、またはデフォルト値を使用
      if (bannerRef.current) {
        setBannerHeight(bannerRef.current.offsetHeight)
      } else {
        // デフォルトの高さ（py-3 * 2 + text height）
        setBannerHeight(70)
      }
    }
  }, [user, isFreeUser])

  // バナーがレンダリングされた後に正確な高さを再測定
  useEffect(() => {
    if (bannerRef.current && (!user || isFreeUser)) {
      const height = bannerRef.current.offsetHeight
      if (height > 0) {
        setBannerHeight(height)
      }
    }
  }, [user, isFreeUser, showBannerAnim, showPurchaseBannerAnim])

  // バナー表示条件
  const isElearningPage = pathname.startsWith('/e-learning')
  // ログインバナー: 未ログインユーザー向け（eラーニングページではモーダルがあるため非表示）
  // user=nullの状態で即座に表示（ログイン済みならonAuthStateChangeで更新される）
  const showLoginBanner = !user && !isElearningPage
  // 購入促進バナー: 無料ログインユーザー向け（全ページで表示）
  const showPurchaseBanner = !!isFreeUser
  // いずれかのバナーを表示するか
  const showBanner = showLoginBanner || showPurchaseBanner

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

  // フローティングボタンの bottom 位置（バナーがアニメーション表示中の時のみ高さを加算）
  const bannerAnimating = (showLoginBanner && showBannerAnim) || (showPurchaseBanner && showPurchaseBannerAnim)
  const floatingBottom = bannerAnimating ? bannerHeight + 16 : 24

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

      {/* ログインバナー（未ログインユーザー向け） */}
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

      {/* 購入促進バナー（無料ログインユーザー向け） */}
      {showPurchaseBanner && (
        <div
          ref={bannerRef}
          className={`fixed bottom-0 left-0 xl:left-[178px] right-0 z-30 transition-all duration-500 ease-out ${
            showPurchaseBannerAnim
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-full'
          }`}
        >
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="block w-full bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center py-3 gap-3">
                <Image
                  src="/images/banner/banner_sm.svg"
                  alt="今だけ半額！50%OFF"
                  width={152}
                  height={52}
                  className="h-[36px] sm:h-[52px] w-auto"
                />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-white text-xs sm:text-base font-semibold">
                    全ての有料コンテンツが見放題！
                  </p>
                  <p className="text-white text-xs sm:text-base font-semibold flex items-center gap-1">
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
