'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { Check, X, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function DebugPage() {
  const [status, setStatus] = useState<{
    env: boolean
    connection: boolean
    auth: boolean
    user: any
  }>({
    env: false,
    connection: false,
    auth: false,
    user: null
  })
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const checkStatus = async () => {
    setLoading(true)
    setLogs([])
    
    // 1. 環境変数チェック
    addLog('環境変数をチェック中...')
    const envCheck = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    setStatus(prev => ({ ...prev, env: envCheck }))
    
    if (envCheck) {
      addLog('✓ 環境変数が設定されています')
      addLog(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
    } else {
      addLog('✗ 環境変数が設定されていません')
      setLoading(false)
      return
    }

    // 2. Supabase接続チェック
    try {
      addLog('Supabaseへの接続をテスト中...')
      const supabase = createClient()
      const { data, error } = await supabase.from('projects').select('count').limit(1)
      
      if (error && error.code !== 'PGRST116') { // テーブルが存在しない場合のエラーは無視
        throw error
      }
      
      setStatus(prev => ({ ...prev, connection: true }))
      addLog('✓ Supabaseに接続できました')
    } catch (error: any) {
      setStatus(prev => ({ ...prev, connection: false }))
      addLog(`✗ Supabase接続エラー: ${error.message}`)
      setLoading(false)
      return
    }

    // 3. 認証チェック
    try {
      addLog('認証状態をチェック中...')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setStatus(prev => ({ ...prev, auth: true, user }))
        addLog(`✓ ログイン中: ${user.email}`)
      } else {
        setStatus(prev => ({ ...prev, auth: false }))
        addLog('現在ログインしていません')
      }
    } catch (error: any) {
      addLog(`認証チェックエラー: ${error.message}`)
    }

    setLoading(false)
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const testLogin = async () => {
    addLog('テストログインを実行中...')
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'tamogami@landbridge.co.jp',
        password: 'Lb@123456'
      })
      
      if (error) {
        addLog(`✗ ログインエラー: ${error.message}`)
        if (error.message.includes('Invalid login credentials')) {
          addLog('→ メール確認が必要か、パスワードが異なります')
        }
      } else {
        addLog('✓ ログイン成功！')
        checkStatus()
      }
    } catch (error: any) {
      addLog(`✗ エラー: ${error.message}`)
    }
  }

  const resetPassword = async () => {
    addLog('パスワードリセットメールを送信中...')
    const supabase = createClient()
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        'tamogami@landbridge.co.jp',
        {
          redirectTo: `${window.location.origin}/login`,
        }
      )
      
      if (error) {
        addLog(`✗ リセットエラー: ${error.message}`)
      } else {
        addLog('✓ パスワードリセットメールを送信しました')
        addLog('メールを確認してパスワードをリセットしてください')
      }
    } catch (error: any) {
      addLog(`✗ エラー: ${error.message}`)
    }
  }

  const createTestUser = async () => {
    addLog('テストユーザーを作成中...')
    const supabase = createClient()
    
    try {
      // まず既存のユーザーを確認
      const { data: existingSession } = await supabase.auth.getSession()
      if (existingSession?.session) {
        addLog('既にログイン中です')
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email: 'tamogami@landbridge.co.jp',
        password: 'Lb@123456',
        options: {
          data: { role: 'admin' },
          emailRedirectTo: `${window.location.origin}/admin`
        }
      })
      
      if (error) {
        if (error.message.includes('User already registered')) {
          addLog('ユーザーは既に登録されています')
          addLog('→ 「ユーザーをリセット」ボタンで削除してから再作成してください')
        } else {
          addLog(`✗ ユーザー作成エラー: ${error.message}`)
        }
      } else {
        addLog('✓ ユーザー作成成功！')
        if (!data.user?.email_confirmed_at) {
          addLog('⚠️ メール確認が必要です')
          addLog('Supabaseダッシュボードで手動確認するか、')
          addLog('メール確認を無効にしてください')
        } else {
          addLog('メール確認済みです')
          addLog('→ テストログインを実行してください')
        }
      }
    } catch (error: any) {
      addLog(`✗ エラー: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Supabase診断ツール</h1>
            <button
              onClick={checkStatus}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              再チェック
            </button>
          </div>

          {/* ステータス表示 */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              {status.env ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">環境変数</span>
            </div>

            <div className="flex items-center gap-3">
              {status.connection ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">Supabase接続</span>
            </div>

            <div className="flex items-center gap-3">
              {status.auth ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <span className="font-medium">認証状態</span>
              {status.user && (
                <span className="text-sm text-gray-600">({status.user.email})</span>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={createTestUser}
              className="px-4 py-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white rounded-lg transition-colors"
              disabled={loading}
            >
              テストユーザー作成
            </button>
            <button
              onClick={testLogin}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              テストログイン
            </button>
            <button
              onClick={resetPassword}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              パスワードリセット
            </button>
          </div>
          
          {/* Supabase設定へのリンク */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ メール確認が必要です</h3>
            <p className="text-sm text-yellow-700 mb-3">
              ユーザーは作成されましたが、メール確認が必要な設定になっています。
            </p>
            <ol className="text-sm text-yellow-700 space-y-2 list-decimal list-inside">
              <li>
                <a 
                  href="https://supabase.com/dashboard/project/mtyogrpeeeggqoxzvyry/auth/providers" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-portfolio-blue hover:underline"
                >
                  Supabaseダッシュボード
                </a>
                を開く
              </li>
              <li>Authentication → Providers → Email</li>
              <li>「Confirm email」をOFFにする</li>
              <li>保存して、再度テストユーザーを作成</li>
            </ol>
            <div className="mt-4 pt-4 border-t border-yellow-300">
              <p className="text-sm font-semibold text-yellow-800 mb-2">または、手動で確認する場合：</p>
              <a 
                href="https://supabase.com/dashboard/project/mtyogrpeeeggqoxzvyry/auth/users" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
              >
                Supabaseユーザー管理画面を開く
              </a>
              <p className="text-xs text-yellow-600 mt-2">
                ユーザーを見つけて「...」メニューから「Confirm email」を選択
              </p>
            </div>
          </div>

          {/* ログ表示 */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">実行ログ</h3>
            <div className="space-y-1 font-mono text-xs text-gray-400">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
              {loading && (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>処理中...</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-4 text-sm">
            <Link href="/login" className="text-portfolio-blue hover:underline">
              ← ログイン画面へ
            </Link>
            <Link href="/login/simple-setup" className="text-portfolio-blue hover:underline">
              簡易セットアップへ
            </Link>
            <Link href="/login/alternative-setup" className="text-portfolio-blue hover:underline">
              代替セットアップへ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}