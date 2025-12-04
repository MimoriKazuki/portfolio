'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import Sidebar from './Sidebar'
import FixedBottomElements from './FixedBottomElements'
import Footer from './Footer'
import MobileHeader from './MobileHeader'

// RightSidebarをクライアントサイドのみでレンダリング（ハイドレーションエラー防止）
const RightSidebar = dynamic(() => import('./RightSidebar'), {
  ssr: false
})

const DynamicRightSidebar = dynamic(() => import('./DynamicRightSidebar'), {
  ssr: false
})

interface MainLayoutProps {
  children: React.ReactNode
  hideRightSidebar?: boolean
  hideContactButton?: boolean
  dynamicSidebar?: {
    enterpriseServiceId?: string
    individualServiceId?: string
  }
}

export default function MainLayout({ children, hideRightSidebar = false, hideContactButton = false, dynamicSidebar }: MainLayoutProps) {
  const sidebarRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  // クライアントサイドナビゲーション時にstickyポジションを再計算させる
  useEffect(() => {
    if (sidebarRef.current) {
      // スタイルを一時的に変更して再計算をトリガー
      const sidebar = sidebarRef.current
      sidebar.style.position = 'relative'
      // 次のフレームでstickyに戻す
      requestAnimationFrame(() => {
        sidebar.style.position = ''
      })
    }
  }, [pathname])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Next.js App Router スクロールリセット用アンカー要素 */}
      <div />

      {/* Fixed background layer to prevent overscroll color */}
      <div className="fixed inset-0 bg-gray-50" style={{ zIndex: -1 }} aria-hidden="true" />

      {/* Left Sidebar Background - Fixed */}
      <div
        className="fixed top-0 left-0 w-[178px] h-screen bg-white border-r border-gray-200 hidden xl:block z-30"
        aria-hidden="true"
      />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Left Sidebar Content - Fixed */}
      <aside className="fixed top-0 left-0 w-[178px] h-screen z-30 hidden xl:block overflow-hidden">
        <div className="h-full">
          <Sidebar />
        </div>
      </aside>

      {/* Body - contains all main content */}
      <div className="flex-1 flex">
        {/* Left Sidebar Spacer - maintains layout space */}
        <div className="w-[178px] flex-shrink-0 hidden xl:block" />

        {/* Main Content Container */}
        <div className="flex-1 min-w-0">
          <div className="h-full overflow-x-visible">
            <div className="flex items-start gap-8 px-4 sm:px-6 lg:px-8 py-8">
              <main className="flex-1 min-w-0">
                {children}
              </main>

              {/* Right Sidebar */}
              {!hideRightSidebar && (
                <aside
                  ref={sidebarRef}
                  className="w-[260px] flex-shrink-0 hidden xl:block self-start sticky top-8"
                >
                  {dynamicSidebar ? (
                    <DynamicRightSidebar
                      enterpriseServiceId={dynamicSidebar.enterpriseServiceId}
                      individualServiceId={dynamicSidebar.individualServiceId}
                    />
                  ) : (
                    <RightSidebar />
                  )}
                </aside>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - z-index higher than sidebar so sidebar hides behind it */}
      <div className="relative z-40">
        <Footer />
      </div>

      {/* フローティングCTA & ログインバナー（統合コンポーネント） */}
      <FixedBottomElements hideContactButton={hideContactButton} />
    </div>
  )
}
