'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Mail } from 'lucide-react'
import { cn } from '@/app/lib/utils'

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // メニュー展開時にスクロールを無効化
  useEffect(() => {
    if (isMenuOpen) {
      // 現在のスクロール位置を保存
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      // スクロール位置を復元
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const menuItems = [
    { href: '/', label: 'トップ' },
    { href: '/services', label: 'サービス' },
    { href: '/projects', label: '制作実績' },
    { href: '/youtube-videos', label: 'YouTube' },
    { href: '/columns', label: 'コラム' },
    { href: '/notices', label: 'お知らせ' },
    { href: '/documents', label: '資料請求' },
    { href: '/contact', label: '問い合わせ' },
  ]

  return (
    <>
      {/* Mobile Header - sticky に変更（Safari viewport バグ対策） */}
      {/* viewport-fit: cover 使用時、safe-area-inset-top でノッチ/ステータスバー領域を確保 */}
      <header
        className="xl:hidden sticky top-0 z-50 bg-white border-b border-gray-200"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/brand/AI_driven_logo_light.png"
              alt="AI駆動研究所"
              width={120}
              height={34}
              className="h-8 w-auto"
            />
          </Link>

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-[45] bg-black/30" onClick={toggleMenu} />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`xl:hidden fixed top-16 right-0 bottom-0 z-50 w-64 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="py-6 px-4 h-full flex flex-col">
          <div className="space-y-1 flex-1">
            {menuItems.map((item) => {
              const isActive = item.href === '/'
                ? pathname === item.href
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block w-full px-4 py-3 text-center transition-all duration-200 relative group",
                    isActive
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                  style={isActive ? { fontWeight: 550 } : { fontWeight: 500 }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{item.label}</span>

                  {/* アクティブ時: 青い下線 */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-px bg-blue-600"></span>
                  )}

                  {/* ホバー時: 左から右に伸びる下線 */}
                  {!isActive && (
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-gray-900 transition-all duration-300 ease-out group-hover:w-full"></span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Contact Info */}
          <div className="py-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-2">お問い合わせ</p>
            <a
              href="mailto:info@landbridge.co.jp"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Mail className="h-4 w-4" />
              info@landbridge.co.jp
            </a>
          </div>
        </nav>
      </div>

      {/* sticky ヘッダーはスペーサー不要（文書フロー内に存在するため） */}
    </>
  )
}
