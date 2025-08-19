'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FolderOpen, FileText, Download, User, Mail } from 'lucide-react'
import { cn } from '@/app/lib/utils'

export default function AdminSidebar() {
  const pathname = usePathname()
  
  const menuItems = [
    { icon: Home, label: 'ダッシュボード', href: '/admin' },
    { icon: FolderOpen, label: 'プロジェクト', href: '/admin/projects' },
    { icon: FileText, label: 'コラム', href: '/admin/columns' },
    { icon: Download, label: 'ドキュメント', href: '/admin/documents' },
    { icon: User, label: 'プロフィール', href: '/admin/profile' },
    { icon: Mail, label: 'お問い合わせ', href: '/admin/contacts' },
  ]

  return (
    <nav className="w-56 bg-white border-r border-gray-200 min-h-screen pt-20">
      <div className="p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-gray-100 text-gray-700 hover:text-portfolio-blue",
                  isActive && "bg-portfolio-blue/10 text-portfolio-blue font-medium"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}