'use client'

import { useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { Lock, Mail, User, Check, X } from 'lucide-react'
import Link from 'next/link'

export default function SetupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const supabase = createClient()

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // 新規ユーザー作成
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'admin'
          }
        }
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'ユーザーが作成されました。メールアドレスの確認が必要な場合は、確認メールをチェックしてください。'
      })
      
      // フォームをリセット
      setEmail('')
      setPassword('')
    } catch (error: any) {
      console.error('Error creating user:', error)
      setMessage({
        type: 'error',
        text: error.message || 'ユーザー作成中にエラーが発生しました'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestLogin = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'ログインテスト成功！この認証情報でログインできます。'
      })
    } catch (error: any) {
      console.error('Login test error:', error)
      setMessage({
        type: 'error',
        text: 'ログインテスト失敗: ' + error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-portfolio-blue rounded-lg flex items-center justify-center">
            <User className="h-7 w-7 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">管理者ユーザー作成</h1>
        <p className="text-sm text-gray-600 text-center mb-8">
          Supabaseに管理者ユーザーを作成します
        </p>
        
        <form onSubmit={handleCreateUser} className="space-y-6">
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
                placeholder="admin@example.com"
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
                minLength={6}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">6文字以上で設定してください</p>
          </div>
          
          {message && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              {message.type === 'success' ? (
                <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-portfolio-blue hover:bg-portfolio-blue-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '作成中...' : 'ユーザーを作成'}
            </button>
            
            <button
              type="button"
              onClick={handleTestLogin}
              disabled={loading || !email || !password}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ログインテスト
            </button>
          </div>
        </form>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium">注意事項：</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>メールアドレスは実在するものを使用してください</li>
              <li>Supabaseの設定によってはメール確認が必要な場合があります</li>
              <li>作成後は「ログインテスト」ボタンで確認してください</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/login" className="hover:text-portfolio-blue transition-colors">
            ← ログイン画面に戻る
          </Link>
        </div>
      </div>
    </div>
  )
}