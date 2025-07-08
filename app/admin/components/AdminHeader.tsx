'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { LogOut, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AdminHeaderProps {
  user: SupabaseUser
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-youtube-gray border-b border-border z-50">
      <div className="flex items-center justify-between h-full px-6">
        <h1 className="text-xl font-bold">Portfolio Admin</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{user.email}</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-youtube-dark transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">ログアウト</span>
          </button>
        </div>
      </div>
    </header>
  )
}