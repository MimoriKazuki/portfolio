'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { LogIn, LogOut, Loader2, User as UserIcon } from 'lucide-react'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    // 二重実行防止
    if (initializedRef.current) return
    initializedRef.current = true

    const supabase = createClient()

    const initAuth = async () => {
      try {
        console.log('[AuthButton] Fetching user from API...')
        const startTime = Date.now()

        // サーバーサイドAPIを使用してユーザー情報を取得
        const response = await fetch('/api/auth/user')
        const data = await response.json()

        const elapsed = Date.now() - startTime
        console.log(`[AuthButton] API response in ${elapsed}ms:`, data.user ? data.user.email : 'null')

        setUser(data.user)
        setLoading(false)
      } catch (e) {
        console.error('[AuthButton] Init error:', e)
        setUser(null)
        setLoading(false)
      }
    }

    initAuth()

    // onAuthStateChangeで以降の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthButton] onAuthStateChange:', event)
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // ログイン後は常にeラーニングトップへ遷移
        redirectTo: `${window.location.origin}/auth/callback?redirect_to=/e-learning`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    setMenuOpen(false)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error('[AuthButton] Logout error:', e)
    }
    window.location.href = '/'
  }

  // ローディング中
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center px-4 py-3">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    )
  }

  if (user) {
    return (
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          disabled={loggingOut}
          className="group w-full flex items-center gap-2 px-3 py-3 text-sm text-gray-600 font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          ) : (
            <>
              <UserIcon className="h-4 w-4 flex-shrink-0 text-gray-500" />
              <span className="truncate text-xs text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                {user.email}
              </span>
            </>
          )}
        </button>

        {/* ポップアップメニュー */}
        {menuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 shadow-lg z-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>ログアウト</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleLogin}
      className="group w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-gray-600 font-medium border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
    >
      <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
      <span className="group-hover:text-gray-900 transition-colors duration-200">ログイン</span>
    </button>
  )
}
