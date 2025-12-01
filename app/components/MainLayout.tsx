'use client'

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
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed background layer to prevent overscroll color */}
      <div className="fixed inset-0 bg-gray-50" style={{ zIndex: -1 }} aria-hidden="true" />
      
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Body - contains all main content */}
      <div className="flex-1 flex items-start">
        {/* Left Sidebar - Fixed to left edge */}
        <aside className="w-[178px] flex-shrink-0 hidden xl:block bg-white border-r border-gray-200 sticky top-0 h-screen">
          <div className="h-full overflow-y-auto">
            <Sidebar />
          </div>
        </aside>
        
        {/* Main Content Container with Horizontal Scroll for 1025px-1280px */}
        <div className="flex-1 min-w-0">
          {/* Scrollable container for mid-range sizes */}
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
      
      {/* Footer */}
      <Footer />
      
      {!hideContactButton && <FloatingButtons />}
    </div>
  )
}