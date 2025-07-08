'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Home, FolderOpen, Mail } from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: FolderOpen, label: 'Projects', href: '/projects' },
    { icon: Mail, label: 'Contact', href: '/contact' },
  ]

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3 bg-youtube-dark border-b border-border sticky top-0 z-50">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <h1 className="text-xl font-bold transition-colors duration-200 group-hover:text-blue-400">Portfolio</h1>
          </Link>
        </div>

        {/* モバイルメニューボタン */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 hover:bg-youtube-gray rounded-lg transition-colors"
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
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-64 bg-youtube-dark border-l border-border z-50 md:hidden transform transition-transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600/10 transition-colors"
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