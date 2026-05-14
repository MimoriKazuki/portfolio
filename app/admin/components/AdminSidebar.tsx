'use client'

import { memo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, FolderOpen, FileText, Download, Users, Mail, LogOut, Bell, BarChart2, Youtube, PlayCircle } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { createClient } from '@/app/lib/supabase/client'
import Image from 'next/image'

// F-05：eラーニング配下に常時展開のサブナビを追加。
// 管理側 C001 / C004 / C005 / C009 / C010 / C011 への導線を sidebar に集約し、
// 管理画面トップ Action bar 任せだった導線分散を解消する。
// 「eラーニング」セクションが active なときのみ展開（pathname.startsWith('/admin/e-learning')）。
const eLearningSubItems: { label: string; href: string }[] = [
  { label: '単体動画一覧', href: '/admin/e-learning' },
  { label: 'カテゴリ管理', href: '/admin/e-learning/categories' },
  { label: 'コース一覧', href: '/admin/e-learning/courses' },
  { label: '購入履歴', href: '/admin/e-learning/purchases' },
  { label: 'フルアクセスユーザー', href: '/admin/e-learning/users' },
  { label: 'レガシー購入', href: '/admin/e-learning/legacy-purchases' },
]

const AdminSidebar = memo(function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const menuItems = [
    { icon: Home, label: 'ダッシュボード', href: '/admin' },
    { icon: FolderOpen, label: '制作実績', href: '/admin/projects' },
    { icon: Youtube, label: 'YouTube', href: '/admin/youtube-videos' },
    { icon: PlayCircle, label: 'eラーニング', href: '/admin/e-learning' },
    { icon: Users, label: '顧客管理', href: '/admin/customers' },
    { icon: FileText, label: 'コラム', href: '/admin/columns' },
    { icon: BarChart2, label: 'コラム分析', href: '/admin/analytics/column-goals' },
    { icon: Bell, label: 'お知らせ', href: '/admin/notices' },
    { icon: Download, label: '掲載資料', href: '/admin/documents' },
    { icon: Mail, label: 'お問い合わせ', href: '/admin/contacts' },
  ]

  const isELearningArea = pathname.startsWith('/admin/e-learning')

  return (
    <nav className="w-56 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 flex justify-center">
        <Link href="/admin" className="block">
          <Image
            src="/images/brand/AI_driven_logo_light.png"
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
            const isELearningItem = item.href === '/admin/e-learning'

            return (
              <div key={item.href}>
                <Link
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

                {/* F-05：eラーニング配下のサブナビ（active 時のみ展開） */}
                {isELearningItem && isELearningArea && (
                  <ul className="ml-7 mt-1 mb-1 space-y-0.5 border-l border-gray-200 pl-3">
                    {eLearningSubItems.map((sub) => {
                      // /admin/e-learning は配下が深いため完全一致でのみ active 化（誤一致防止）
                      const isSubActive = sub.href === '/admin/e-learning'
                        ? pathname === sub.href
                        : pathname === sub.href || pathname.startsWith(sub.href + '/')
                      return (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            className={cn(
                              "block px-3 py-1.5 rounded-md text-sm transition-colors",
                              "hover:bg-gray-100 text-gray-600 hover:text-portfolio-blue",
                              isSubActive && "bg-portfolio-blue/5 text-portfolio-blue font-medium"
                            )}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
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