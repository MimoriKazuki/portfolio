'use client'

import { useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AlternativeSetupPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()
  
  // 代替メールアドレス
  const alternativeEmail = 'admin@landbridge.co.jp'
  const password = 'Lb@123456'

  const handleSetup = async () => {
    setLoading(true)
    setMessage(null)

    try {
      // 新しいメールアドレスでユーザー作成
      const { data, error } = await supabase.auth.signUp({
        email: alternativeEmail,
        password: password,
        options: {
          data: { role: 'admin' }
        }
      })

      if (error) {
        if (error.message.includes('User already registered')) {
          // 既に登録されている場合はログインを試みる
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: alternativeEmail,
            password: password,
          })
          
          if (!loginError) {
            setMessage({
              type: 'success',
              text: 'ログイン成功！管理画面にリダイレクトします...'
            })
            setTimeout(() => {
              router.push('/admin')
            }, 1500)
          } else {
            setMessage({
              type: 'error',
              text: 'このメールアドレスも既に使用されています。'
            })
          }
        } else {
          setMessage({
            type: 'error',
            text: `エラー: ${error.message}`
          })
        }
        return
      }

      // 作成成功
      setMessage({
        type: 'success',
        text: 'ユーザー作成成功！3秒後に自動的にログインします...'
      })
      
      // 自動ログイン
      setTimeout(async () => {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: alternativeEmail,
          password: password,
        })
        
        if (!loginError) {
          router.push('/admin')
        } else {
          setMessage({
            type: 'info',
            text: 'ログイン画面から手動でログインしてください。'
          })
        }
      }, 3000)
      
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: `エラー: ${err.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">代替セットアップ</h1>
          <p className="text-gray-600">
            既存のメールアドレスで問題がある場合、別のメールアドレスでセットアップします。
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800 mb-2">代替認証情報</p>
              <div className="space-y-1 text-sm text-blue-700">
                <p>メールアドレス: <code className="bg-blue-100 px-2 py-1 rounded">{alternativeEmail}</code></p>
                <p>パスワード: <code className="bg-blue-100 px-2 py-1 rounded">{password}</code></p>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            {message.type === 'success' && <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />}
            {message.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />}
            {message.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />}
            <p className={`text-sm ${
              message.type === 'success' ? 'text-green-800' :
              message.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleSetup}
            disabled={loading}
            className="w-full bg-portfolio-blue hover:bg-portfolio-blue-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '処理中...' : '代替ユーザーでセットアップ'}
          </button>

          <div className="flex gap-4 justify-center text-sm">
            <Link href="/login" className="text-gray-600 hover:text-portfolio-blue transition-colors">
              ← ログイン画面へ
            </Link>
            <Link href="/login/debug" className="text-gray-600 hover:text-portfolio-blue transition-colors">
              診断ツールへ
            </Link>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>注意:</strong> この方法は既存のメールアドレスで問題がある場合の回避策です。
            本来は環境変数の<code className="bg-gray-200 px-1">ADMIN_EMAIL</code>で指定されたメールアドレスを使用することを推奨します。
          </p>
        </div>
      </div>
    </div>
  )
}