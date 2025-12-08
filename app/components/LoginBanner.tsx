'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useELearningRelease } from '@/app/contexts/ELearningReleaseContext'

interface LoginBannerProps {
  onVisibilityChange?: (visible: boolean) => void
}

export default function LoginBanner({ onVisibilityChange }: LoginBannerProps) {
  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const { handleELearningClick } = useELearningRelease()

  useEffect(() => {
    const supabase = createClient()

    // onAuthStateChangeで認証状態を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        setUser(session?.user ?? null)
        setAuthChecked(true)
      } else if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // バナーの表示状態を親コンポーネントに通知
  useEffect(() => {
    const isVisible = authChecked && !user
    onVisibilityChange?.(isVisible)
  }, [authChecked, user, onVisibilityChange])

  // 認証未チェックまたはログイン済みの場合は非表示
  if (!authChecked || user) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 xl:left-[178px] right-0 z-30">
      <Link
        href="/e-learning"
        onClick={handleELearningClick}
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
