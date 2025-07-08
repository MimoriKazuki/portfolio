'use client'

import { Home, FolderOpen, Mail } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/app/lib/utils'

const Sidebar = () => {
  const pathname = usePathname()
  
  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: FolderOpen, label: 'Projects', href: '/projects' },
    { icon: Mail, label: 'Contact', href: '/contact' },
  ]


  return (
    <aside className="fixed left-0 top-16 h-full w-60 bg-youtube-dark border-r border-border z-40 overflow-y-auto hidden md:block">
      <div className="py-4">
        <div className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-blue-600/10",
                  isActive && "bg-blue-600/20 text-blue-400"
                )}
                prefetch={true}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar