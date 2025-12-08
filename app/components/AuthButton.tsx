'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { LogIn, LogOut, Loader2, User as UserIcon } from 'lucide-react'

export default function AuthButton() {
  // 最初からログインボタンを表示（loading=false）
  // ユーザーが検出されたら更新する
  const [user, setUser] = useState<User | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isMounted = true
    let supabase: ReturnType<typeof createClient>

    try {
      supabase = createClient()
    } catch (e) {
      console.error('[AuthButton] Failed to create Supabase client:', e)
      return
    }

    // 1. 最初にgetSessionでセッションを直接確認（onAuthStateChangeのバックアップ）
    const checkSession = async () => {
      try {
        console.log('[AuthButton] Checking session with getSession()...')
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('[AuthButton] getSession result:', {
          hasSession: !!session,
          user: session?.user?.email ?? 'none',
          error: error?.message ?? 'none'
        })
        if (isMounted && session?.user) {
          setUser(session.user)
        }
      } catch (e) {
        console.error('[AuthButton] getSession error:', e)
      }
    }
    checkSession()

    // 2. onAuthStateChangeも設定（状態変化を監視）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthButton] onAuthStateChange:', event, session?.user?.email ?? 'none')
      if (isMounted) {
        setUser(session?.user ?? null)
      }
    })

    return () => {
      isMounted = false
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
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // サイドバーからのログインはeラーニングトップに遷移
        redirectTo: `${window.location.origin}/auth/callback?redirect_to=/e-learning`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        skipBrowserRedirect: true, // 自動リダイレクトを無効化
      },
    })

    // 同一タブでリダイレクト
    if (data?.url && !error) {
      window.location.href = data.url
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    setMenuOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
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
