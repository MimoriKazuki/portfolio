'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FolderOpen, User, Settings } from 'lucide-react'
import { cn } from '@/app/lib/utils'

export default function AdminSidebar() {
  const pathname = usePathname()
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/admin' },
    { icon: FolderOpen, label: 'Projects', href: '/admin/projects' },
    { icon: User, label: 'Profile', href: '/admin/profile' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ]

  return (
    <aside className="fixed left-0 top-16 h-full w-60 bg-youtube-gray border-r border-border">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "hover:bg-youtube-dark"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}