'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Lock, Mail } from 'lucide-react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 text-sm text-red-400">
        <p className="font-semibold mb-2">環境変数エラー</p>
        <p>Supabaseの環境変数が設定されていません。</p>
        <p className="text-xs mt-2">本番環境で環境変数を設定してください。</p>
      </div>
    )
  }
  
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      // ログイン成功後、セッションが確立されるまで少し待つ
      console.log('Login successful, waiting for session...')
      
      // セッションの確認
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log('Session established, redirecting...')
        // ページ全体をリロードしてサーバーサイドの認証状態を更新
        window.location.href = '/admin'
      } else {
        setError('セッションの確立に失敗しました')
        setLoading(false)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('予期しないエラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          メールアドレス
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-youtube-dark border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="admin@portfolio.com"
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          パスワード
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-youtube-dark border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="••••••••"
            required
          />
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900/20 border border-red-900 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  )
}