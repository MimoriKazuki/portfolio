'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Mail, LogIn, LogOut, Loader2, User as UserIcon } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { createClient } from '@/app/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [authMenuOpen, setAuthMenuOpen] = useState(false)
  const authMenuRef = useRef<HTMLDivElement>(null)
  const authLoadingRef = useRef(true)
  const pathname = usePathname()

  // 認証状態を取得（getSessionを使用してローカルセッションを即座にチェック）
  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const initAuth = async () => {
      try {
        // getSessionはローカルのセッションを即座にチェック（ネットワーク不要）
        const { data: { session } } = await supabase.auth.getSession()
        if (isMounted) {
          setUser(session?.user ?? null)
          authLoadingRef.current = false
          setAuthLoading(false)
        }
      } catch {
        if (isMounted) {
          setUser(null)
          authLoadingRef.current = false
          setAuthLoading(false)
        }
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null)
        authLoadingRef.current = false
        setAuthLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // メニュー展開時にスクロールを無効化
  useEffect(() => {
    if (isMenuOpen) {
      // 現在のスクロール位置を保存
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      // スクロール位置を復元
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  // 認証メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (authMenuRef.current && !authMenuRef.current.contains(event.target as Node)) {
        setAuthMenuOpen(false)
      }
    }

    if (authMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [authMenuOpen])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogin = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect_to=/e-learning`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        skipBrowserRedirect: true,
      },
    })

    if (data?.url && !error) {
      window.location.href = data.url
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    setAuthMenuOpen(false)
    setIsMenuOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const menuItems = [
    { href: '/', label: 'トップ' },
    { href: '/services', label: 'サービス' },
    { href: '/e-learning', label: 'eラーニング' },
    { href: '/projects', label: '制作実績' },
    { href: '/youtube-videos', label: 'YouTube' },
    { href: '/columns', label: 'コラム' },
    { href: '/notices', label: 'お知らせ' },
    { href: '/documents', label: '資料請求' },
    { href: '/contact', label: '問い合わせ' },
  ]

  return (
    <>
      {/* Mobile Header - 標準的なfixedヘッダー */}
      <header className="xl:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/brand/AI_driven_logo_light.png"
              alt="AI駆動研究所"
              width={120}
              height={34}
              className="h-8 w-auto"
            />
          </Link>

          {/* Right side: Auth Button + Hamburger */}
          <div className="flex items-center gap-2">
            {/* Auth Button */}
            {authLoading ? (
              <div className="p-2">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : user ? (
              <div ref={authMenuRef} className="relative">
                <button
                  onClick={() => setAuthMenuOpen(!authMenuOpen)}
                  disabled={loggingOut}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                  {loggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="max-w-[60px] truncate">{user.email}</span>
                    </>
                  )}
                </button>

                {/* ポップアップメニュー */}
                {authMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 shadow-lg z-50 min-w-[120px]">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>ログアウト</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>ログイン</span>
              </button>
            )}

            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-[45] bg-black/30" onClick={toggleMenu} />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`xl:hidden fixed top-16 right-0 bottom-0 z-50 w-64 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="py-6 px-4 h-full flex flex-col">
          <div className="space-y-1 flex-1">
            {menuItems.map((item) => {
              const isActive = item.href === '/'
                ? pathname === item.href
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block w-full px-4 py-3 text-center transition-all duration-200 relative group",
                    isActive
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                  style={isActive ? { fontWeight: 550 } : { fontWeight: 500 }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{item.label}</span>

                  {/* アクティブ時: 青い下線 */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-px bg-blue-600"></span>
                  )}

                  {/* ホバー時: 左から右に伸びる下線 */}
                  {!isActive && (
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-gray-900 transition-all duration-300 ease-out group-hover:w-full"></span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Contact Info */}
          <div className="py-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-2">お問い合わせ</p>
            <a
              href="mailto:info@landbridge.co.jp"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Mail className="h-4 w-4" />
              info@landbridge.co.jp
            </a>
          </div>
        </nav>
      </div>

      {/* fixedヘッダーのスペーサー（h-16 = 64px） */}
      <div className="xl:hidden h-16" />
    </>
  )
}
