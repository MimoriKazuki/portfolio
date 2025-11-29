'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Home, FolderOpen, BookOpen, Download, Mail, Bell, Briefcase } from 'lucide-react'

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const menuItems = [
    { href: '/', label: 'トップページ', icon: Home },
    { href: '/services', label: 'サービス', icon: Briefcase },
    { href: '/projects', label: '制作実績', icon: FolderOpen },
    { href: '/columns', label: 'コラム', icon: BookOpen },
    { href: '/notices', label: 'お知らせ', icon: Bell },
    { href: '/documents', label: '資料ダウンロード', icon: Download },
    { href: '/contact', label: 'お問い合わせ', icon: Mail },
  ]

  return (
    <>
      {/* Mobile Header */}
      <header className="xl:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/AI_driven_logo_light.png"
              alt="AI駆動研究所"
              width={120}
              height={34}
              className="h-8 w-auto"
            />
          </Link>

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMenu} />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`lg:hidden fixed top-16 right-0 bottom-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Contact Info in Menu */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">お問い合わせ</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <a
                href="mailto:info@landbridge.co.jp"
                className="block hover:text-gray-900"
              >
                info@landbridge.co.jp
              </a>
            </div>
          </div>
        </nav>
      </div>

      {/* Spacer for fixed header on mobile */}
      <div className="lg:hidden h-16" />
    </>
  )
}