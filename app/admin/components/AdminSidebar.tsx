'use client'

import { memo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, FolderOpen, FileText, Download, User, Mail, LogOut, Bell, BarChart2, Youtube } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { createClient } from '@/app/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import Image from 'next/image'

interface AdminSidebarProps {
  user: SupabaseUser
}

const AdminSidebar = memo(function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const menuItems = [
    { icon: Home, label: 'ダッシュボード', href: '/admin' },
    { icon: FolderOpen, label: 'AI制作物', href: '/admin/projects' },
    { icon: Youtube, label: 'YouTube', href: '/admin/youtube-videos' },
    { icon: FileText, label: 'コラム', href: '/admin/columns' },
    { icon: BarChart2, label: 'コラム分析', href: '/admin/analytics/column-goals' },
    { icon: Bell, label: 'お知らせ', href: '/admin/notices' },
    { icon: Download, label: '掲載資料', href: '/admin/documents' },
    { icon: Mail, label: 'お問い合わせ', href: '/admin/contacts' },
  ]

  return (
    <nav className="w-56 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 flex justify-center">
        <Link href="/admin" className="block">
          <Image
            src="/AI_driven_logo_light.png"
            alt="AI駆動研究所 Admin"
            width={140}
            height={40}
            className="object-contain"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </Link>
      </div>
      
      {/* Menu items */}
      <div className="flex-1 p-4">
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
      
      {/* Logout button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600 active:bg-red-100"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">ログアウト</span>
        </button>
      </div>
    </nav>
  )
})

export default AdminSidebar