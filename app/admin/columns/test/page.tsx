'use client'

import { useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'

export default function TestColumnPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const supabase = createClient()

  // ユーザー情報を取得
  const checkUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    setUserInfo({ user, error })
  }

  const testInsert = async () => {
    setLoading(true)
    setResult(null)

    try {
      // 最小限のデータで挿入テスト
      const testData = {
        title: 'テストタイトル',
        slug: 'test-slug-' + Date.now(),
        content: '<p>テストコンテンツ</p>',
        excerpt: 'テスト概要',
        is_featured: false,
        is_published: false,
        author: 'テストユーザー',
        tags: ['テスト', 'サンプル']
      }

      console.log('Inserting test data:', testData)

      const { data, error } = await supabase
        .from('columns')
        .insert([testData])
        .select()

      console.log('Result:', { data, error })
      
      if (error) {
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
      }
      
      setResult({ 
        data, 
        error: error ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error
        } : null 
      })

    } catch (err) {
      console.error('Catch error:', err)
      setResult({ error: err })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Column Insert Test</h1>
      
      <div className="space-x-4 mb-4">
        <button
          onClick={checkUser}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Check User
        </button>
        
        <button
          onClick={testInsert}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Insert'}
        </button>
      </div>

      {userInfo && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <h2 className="font-bold mb-2">User Info:</h2>
          <pre>{JSON.stringify(userInfo, null, 2)}</pre>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Insert Result:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}