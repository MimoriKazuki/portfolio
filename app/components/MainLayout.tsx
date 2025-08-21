'use client'

import Sidebar from './Sidebar'
import RightSidebar from './RightSidebar'
import StickySidebar from './StickySidebar'
import FloatingButtons from './FloatingButtons'
import Footer from './Footer'
import MobileHeader from './MobileHeader'

interface MainLayoutProps {
  children: React.ReactNode
  hideRightSidebar?: boolean
  hideContactButton?: boolean
}

export default function MainLayout({ children, hideRightSidebar = false, hideContactButton = false }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Body - contains all main content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Fixed to left edge */}
        <aside className="w-[178px] flex-shrink-0 hidden lg:block bg-white border-r border-gray-200">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <Sidebar />
          </div>
        </aside>
        
        {/* Main Content Container */}
        <div className="flex-1 overflow-hidden">
          <main className="w-full px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
            <div className="flex gap-8">
              <div className="flex-1 min-w-0">
                {children}
              </div>
              
              {/* Right Sidebar */}
              {!hideRightSidebar && (
                <aside className="w-[260px] flex-shrink-0 hidden lg:block">
                  <StickySidebar>
                    <RightSidebar />
                  </StickySidebar>
                </aside>
              )}
            </div>
          </main>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
      
      {!hideContactButton && <FloatingButtons />}
    </div>
  )
}