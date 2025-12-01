'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Sidebar from './Sidebar'
import FloatingButtons from './FloatingButtons'
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
  const footerRef = useRef<HTMLDivElement>(null)
  const [sidebarOffset, setSidebarOffset] = useState(0)

  useEffect(() => {
    let rafId: number

    const updateSidebarPosition = () => {
      if (!footerRef.current) return

      const footerRect = footerRef.current.getBoundingClientRect()
      const sidebarHeight = window.innerHeight

      // フッターがサイドバーと重なる場合、サイドバーを上にずらす
      if (footerRect.top < sidebarHeight) {
        const offset = sidebarHeight - footerRect.top
        setSidebarOffset(-offset)
      } else {
        setSidebarOffset(0)
      }
    }

    const handleScroll = () => {
      // requestAnimationFrameでスムーズに更新
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateSidebarPosition)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    updateSidebarPosition()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Next.js App Router スクロールリセット用アンカー要素 */}
      {/* fixed/sticky要素の前に配置することで、正しいスクロール位置計算を保証 */}
      {/* 参照: https://github.com/vercel/next.js/issues/49427 */}
      <div />

      {/* Fixed background layer to prevent overscroll color */}
      <div className="fixed inset-0 bg-gray-50" style={{ zIndex: -1 }} aria-hidden="true" />

      {/* Left Sidebar Background - Fixed, full height, behind footer */}
      <div
        className="fixed top-0 left-0 bottom-0 w-[178px] bg-white border-r border-gray-200 hidden xl:block z-30"
        aria-hidden="true"
      />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Left Sidebar Content - Fixed, follows scroll, slides up at footer */}
      <aside
        className="fixed top-0 left-0 h-screen w-[178px] z-[35] hidden xl:block"
        style={{ transform: `translateY(${sidebarOffset}px)` }}
      >
        <Sidebar />
      </aside>

      {/* Body - contains all main content */}
      <div className="flex-1 flex">
        {/* Left Sidebar Spacer - maintains layout space */}
        <div className="w-[178px] flex-shrink-0 hidden xl:block" />

        {/* Main Content Container */}
        <div className="flex-1 min-w-0">
          <div className="h-full overflow-x-visible">
            <div className="flex gap-8 px-4 sm:px-6 lg:px-8 py-8">
              <main className="flex-1 min-w-0">
                {children}
              </main>

              {/* Right Sidebar */}
              {!hideRightSidebar && (
                <aside className="w-[260px] flex-shrink-0 hidden xl:block">
                  <div className="sticky top-8">
                    {dynamicSidebar ? (
                      <DynamicRightSidebar
                        enterpriseServiceId={dynamicSidebar.enterpriseServiceId}
                        individualServiceId={dynamicSidebar.individualServiceId}
                      />
                    ) : (
                      <RightSidebar />
                    )}
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Above sidebar background */}
      <div ref={footerRef} className="relative z-40">
        <Footer />
      </div>

      {!hideContactButton && <FloatingButtons />}
    </div>
  )
}