'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface LoginPromptModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect_to=/e-learning`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('Google login error:', error)
        setError('ログインに失敗しました。もう一度お試しください。')
        setLoading(false)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('予期しないエラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* モーダル（横長） */}
      <div className="relative bg-white shadow-xl max-w-3xl w-full">
        <div className="flex flex-col md:flex-row">
          {/* 左側: メインコンテンツ */}
          <div className="flex-1 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              無料ログイン
            </h2>

            <p className="text-gray-600 mb-8 leading-relaxed">
              eラーニングコンテンツを視聴するには、Googleアカウントでログインしてください。
            </p>

            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="inline-flex items-center justify-center gap-3 w-full px-8 py-4 bg-blue-600 text-white font-medium transition-colors duration-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                <span>
                  {loading ? 'ログイン中...' : 'Googleでログイン'}
                </span>
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center w-full px-8 py-4 bg-white text-gray-700 font-medium border border-gray-300 transition-colors duration-200 hover:bg-gray-50"
              >
                戻る
              </button>
            </div>
          </div>

          {/* 右側: ログインするメリット */}
          <div className="bg-gray-50 p-8 md:p-10 md:w-72 border-t md:border-t-0 md:border-l border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">ログインするメリット</h3>
            <ul className="text-sm text-gray-600 space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 flex-shrink-0">✓</span>
                <span>無料の学習動画にアクセスできます</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 flex-shrink-0">✓</span>
                <span>お気に入りの動画を保存できます</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 flex-shrink-0">✓</span>
                <span>購入したコンテンツを制限なく視聴できます</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
