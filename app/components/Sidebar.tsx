'use client'

import { Home, FolderOpen, Mail, FileText, Download, Bell, Briefcase, Youtube } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/app/lib/utils'

const Sidebar = () => {
  const pathname = usePathname()

  const menuItems = [
    { icon: Home, label: 'トップ', href: '/' },
    { icon: Briefcase, label: 'サービス', href: '/services' },
    { icon: FolderOpen, label: '制作実績', href: '/projects' },
    { icon: Youtube, label: 'YouTube', href: '/youtube-videos' },
    { icon: FileText, label: 'コラム', href: '/columns' },
    { icon: Bell, label: 'お知らせ', href: '/notices' },
    { icon: Download, label: '資料請求', href: '/documents' },
    { icon: Mail, label: '問い合わせ', href: '/contact' },
  ]


  return (
    <nav className="h-full px-4 py-6">
      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <Link href="/" className="block group">
          <Image
            src="/AI_driven_logo_light.png"
            alt="AI駆動研究所"
            width={150}
            height={48}
            style={{ height: 'auto', width: 'auto' }}
            className="h-12 w-auto object-contain transition-opacity duration-200 group-hover:opacity-80"
            priority
          />
        </Link>
      </div>
      
      <div className="space-y-2">
        {menuItems.map((item) => {
          // Check if current path starts with the menu item's href (except for home page)
          const isActive = item.href === '/' 
            ? pathname === item.href 
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block w-full px-4 py-3 transition-all duration-200 text-center relative group",
                isActive 
                  ? "text-portfolio-blue hover:text-blue-700" 
                  : "text-gray-600 hover:text-gray-900 font-medium"
              )}
              style={isActive ? { fontWeight: 550 } : undefined}
              prefetch={true}
            >
              <span>{item.label}</span>
              
              {/* 選択済み: 青い下線（ホバーでも色は変わらない） */}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-px bg-portfolio-blue"></span>
              )}
              
              {/* ホバー時: 左から右に伸びる下線（ホバー時のテキストと同じグレー） */}
              {!isActive && (
                <span className="absolute bottom-0 left-0 w-0 h-px bg-gray-900 transition-all duration-300 ease-out group-hover:w-full"></span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default Sidebar