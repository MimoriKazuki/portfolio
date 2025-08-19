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
  const [showDevCredentials, setShowDevCredentials] = useState(false)
  const router = useRouter()
  
  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
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
        // エラーメッセージを日本語化
        if (error.message.includes('Invalid login credentials')) {
          setError('メールアドレスまたはパスワードが正しくありません')
        } else if (error.message.includes('Email not confirmed')) {
          setError('メールアドレスが確認されていません。確認メールをご確認ください')
        } else {
          setError(error.message)
        }
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
        <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
          メールアドレス
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue focus:border-portfolio-blue text-gray-900"
            placeholder="admin@portfolio.com"
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700">
          パスワード
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue focus:border-portfolio-blue text-gray-900"
            placeholder="••••••••"
            required
          />
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-portfolio-blue hover:bg-portfolio-blue-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
      
      <div className="mt-4 text-center space-y-2">
        <a 
          href="/login/simple-setup" 
          className="block text-sm text-gray-600 hover:text-portfolio-blue transition-colors"
        >
          初期セットアップ
        </a>
        
        <a 
          href="/login/debug" 
          className="block text-sm text-gray-600 hover:text-portfolio-blue transition-colors"
        >
          診断ツール
        </a>
        
        {process.env.NODE_ENV === 'development' && (
          <button
            type="button"
            onClick={() => setShowDevCredentials(!showDevCredentials)}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            開発用認証情報
          </button>
        )}
        
        {showDevCredentials && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
            <p className="font-semibold mb-1">認証情報:</p>
            <p>Email: tamogami@landbridge.co.jp</p>
            <p>Password: Lb@123456</p>
            <p className="mt-2 text-yellow-600">※ セキュリティのため、初回ログイン後にパスワードを変更してください</p>
          </div>
        )}
      </div>
    </form>
  )
}