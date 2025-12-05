'use client'

import { useEffect, useState, useRef } from 'react'
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
  const [sidebarPosition, setSidebarPosition] = useState<'fixed' | 'absolute'>('fixed')
  const [sidebarTop, setSidebarTop] = useState(32) // top-8 = 2rem = 32px
  const sidebarRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  // 右サイドバーのスクロール制御（ServicesContentと同じアプローチ）
  useEffect(() => {
    if (hideRightSidebar) return

    const handleScroll = () => {
      if (!sidebarRef.current || !footerRef.current) return

      const footerRect = footerRef.current.getBoundingClientRect()
      const sidebarHeight = sidebarRef.current.offsetHeight
      const initialTop = 32 // top-8相当

      // フッターに到達したらサイドバーを止める
      if (footerRect.top <= initialTop + sidebarHeight + 32) {
        setSidebarPosition('absolute')
        setSidebarTop(footerRef.current.offsetTop - sidebarHeight - 32)
      } else {
        setSidebarPosition('fixed')
        setSidebarTop(initialTop)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // 初期位置を設定

    return () => window.removeEventListener('scroll', handleScroll)
  }, [hideRightSidebar])

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
          <div className="flex items-start gap-8 px-4 sm:px-6 lg:px-8 py-8">
            <main className="flex-1 min-w-0">
              {children}
            </main>

            {/* Right Sidebar Spacer - maintains layout space */}
            {!hideRightSidebar && (
              <div className="w-[260px] flex-shrink-0 hidden xl:block" />
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Fixed position with JavaScript scroll control */}
      {!hideRightSidebar && (
        <div
          ref={sidebarRef}
          className="hidden xl:block w-[260px] z-20"
          style={{
            position: sidebarPosition,
            top: `${sidebarTop}px`,
            right: '32px', // px-8 = 2rem = 32px
          }}
        >
          {dynamicSidebar ? (
            <DynamicRightSidebar
              enterpriseServiceId={dynamicSidebar.enterpriseServiceId}
              individualServiceId={dynamicSidebar.individualServiceId}
            />
          ) : (
            <RightSidebar />
          )}
        </div>
      )}

      {/* Footer background extension for overscroll - fixed behind all content */}
      <div
        className="fixed left-0 right-0 bottom-0 bg-gray-900 pointer-events-none"
        style={{ height: '100vh', zIndex: -2 }}
        aria-hidden="true"
      />

      {/* Footer - z-index higher than sidebar so sidebar hides behind it */}
      <div ref={footerRef} className="relative z-40">
        <Footer />
      </div>

      {/* フローティングCTA & ログインバナー（統合コンポーネント） */}
      <FixedBottomElements hideContactButton={hideContactButton} />
    </div>
  )
}
