'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface LoginBannerProps {
  onVisibilityChange?: (visible: boolean) => void
}

export default function LoginBanner({ onVisibilityChange }: LoginBannerProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // 初期認証状態を取得
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // バナーの表示状態を親コンポーネントに通知
  useEffect(() => {
    const isVisible = !loading && !user
    onVisibilityChange?.(isVisible)
  }, [loading, user, onVisibilityChange])

  // ローディング中またはログイン済みの場合は非表示
  if (loading || user) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 xl:left-[178px] right-0 z-30">
      <Link
        href="/e-learning"
        className="block w-full bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer"
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-3 gap-1">
            <p className="text-white text-sm sm:text-base font-semibold text-center">
              AI駆動開発特化型のeラーニングサービスを開始しました。
            </p>
            <p className="text-white text-sm sm:text-base font-semibold text-center flex items-center gap-1">
              無料ログインでまずはお試し
              <ChevronRight className="h-4 w-4" />
            </p>
          </div>
        </div>
      </Link>
    </div>
  )
}
