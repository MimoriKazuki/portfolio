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
    console.log('[AuthButton] Setting up auth listener...')

    // フォールバック: 5秒後に強制的にローディングを終了
    const fallbackTimer = setTimeout(() => {
      console.log('[AuthButton] Fallback timer triggered - forcing loading to false')
      setLoading(false)
    }, 5000)

    // getSessionを直接呼び出してセッションを確認
    const checkSession = async () => {
      try {
        console.log('[AuthButton] Checking session via getSession()...')
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('[AuthButton] getSession error:', error)
        } else {
          console.log('[AuthButton] getSession result:', session ? `user=${session.user.email}` : 'no session')
          setUser(session?.user ?? null)
        }

        clearTimeout(fallbackTimer)
        setLoading(false)
      } catch (e) {
        console.error('[AuthButton] getSession exception:', e)
        clearTimeout(fallbackTimer)
        setLoading(false)
      }
    }

    // まずgetSessionで即座に確認
    checkSession()

    // onAuthStateChangeで以降の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthButton] onAuthStateChange:', event, session?.user?.email || 'no user')

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      clearTimeout(fallbackTimer)
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
        redirectTo: `${window.location.origin}/auth/callback?redirect_to=${window.location.pathname}`,
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
    const supabase = createClient()
    await supabase.auth.signOut()
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
