'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, Home, FolderOpen, Mail, FileText, Download } from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { icon: Home, label: 'トップ', href: '/' },
    { icon: FolderOpen, label: 'ポートフォリオ', href: '/projects' },
    { icon: FileText, label: 'コラム', href: '/columns' },
    { icon: Download, label: '資料請求', href: '/documents' },
    { icon: Mail, label: '問い合わせ', href: '/contact' },
  ]

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <Image 
              src="/会社ロゴ.png" 
              alt="LandBridge" 
              width={150} 
              height={48} 
              className="h-12 w-auto object-contain transition-opacity duration-200 group-hover:opacity-80"
              priority
            />
          </Link>
        </div>

        {/* モバイルメニューボタン */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* モバイルメニュー */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />
      <nav
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-64 bg-white border-l border-border z-50 md:hidden transform transition-transform shadow-lg ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-portfolio-blue transition-colors"
              prefetch={true}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}

export default Header