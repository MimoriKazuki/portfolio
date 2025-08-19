'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { Check, Copy, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function SimpleSetupPage() {
  const [adminEmail, setAdminEmail] = useState('')
  const [defaultPassword] = useState('Lb@123456')
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // 環境変数に設定された管理者メールアドレスを使用
    setAdminEmail('tamogami@landbridge.co.jp')
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleQuickSetup = async () => {
    try {
      console.log('セットアップ開始:', { email: adminEmail })
      
      // まずログインを試みる
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: defaultPassword,
      })

      if (loginData?.user) {
        alert('既にセットアップ済みです。ログイン画面から認証情報を使用してログインしてください。')
        return
      }

      console.log('ログイン試行結果:', { loginError })

      // ユーザーが存在しない場合は作成
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password: defaultPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          data: {
            role: 'admin'
          }
        }
      })

      console.log('サインアップ結果:', { signUpData, signUpError })

      if (signUpError) {
        // より詳細なエラーメッセージ
        if (signUpError.message.includes('User already registered')) {
          alert('ユーザーは既に登録されています。パスワードが異なる可能性があります。')
        } else if (signUpError.message.includes('Password should be at least')) {
          alert('パスワードは6文字以上である必要があります。')
        } else {
          alert('エラー: ' + signUpError.message)
        }
        return
      }

      if (signUpData?.user) {
        // メール確認が必要かチェック
        if (signUpData.user.email_confirmed_at) {
          alert('セットアップが完了しました！表示されている認証情報でログインしてください。')
        } else {
          alert('アカウントが作成されました。メール確認が必要な場合は、確認メールをチェックしてください。\n\n開発環境では、そのままログインを試してみてください。')
        }
      }
    } catch (err) {
      console.error('Setup error:', err)
      alert('セットアップ中にエラーが発生しました: ' + (err as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">簡易セットアップ</h1>
          <p className="text-gray-600">
            このページでは、環境変数に設定された管理者アカウントを使用してログインできるようにします。
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">認証情報</p>
              <p>以下の認証情報でログインできます：</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">メールアドレス</span>
              <button
                onClick={() => copyToClipboard(adminEmail)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <code className="text-sm text-gray-900 font-mono">{adminEmail}</code>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">パスワード</span>
              <button
                onClick={() => copyToClipboard(defaultPassword)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <code className="text-sm text-gray-900 font-mono">{defaultPassword}</code>
          </div>
        </div>

        {copied && (
          <div className="mb-4 flex items-center gap-2 text-green-600 text-sm">
            <Check className="h-4 w-4" />
            <span>クリップボードにコピーしました</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleQuickSetup}
            className="w-full bg-portfolio-blue hover:bg-portfolio-blue-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            クイックセットアップを実行
          </button>

          <Link
            href="/login"
            className="block w-full text-center bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            ログイン画面へ
          </Link>
        </div>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">セキュリティに関する注意</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>このパスワードは初期設定用です</li>
                <li>本番環境では必ず変更してください</li>
                <li>環境変数の管理には十分注意してください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}