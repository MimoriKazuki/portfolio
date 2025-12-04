'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface PurchasePromptModalProps {
  isOpen: boolean
  onClose: () => void
  contentId: string
}

export default function PurchasePromptModal({ isOpen, onClose, contentId }: PurchasePromptModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handlePurchase = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '購入処理中にエラーが発生しました')
      }

      // Stripe Checkoutにリダイレクト
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Purchase error:', err)
      setError(err instanceof Error ? err.message : '購入処理中にエラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* モーダル（横長） */}
      <div className="relative bg-white shadow-xl max-w-3xl w-full">
        <div className="flex flex-col md:flex-row">
          {/* 左側: メインコンテンツ */}
          <div className="flex-1 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              有料コンテンツです
            </h2>

            <p className="text-gray-600 mb-4 leading-relaxed">
              このコンテンツは有料会員限定です。
            </p>

            <p className="text-gray-600 mb-8 leading-relaxed">
              <span className="text-2xl font-bold text-gray-900">¥4,980</span>
              <span className="text-sm text-gray-500 ml-2">（税込・買い切り）</span>
            </p>

            <div className="space-y-4">
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="inline-flex items-center justify-center gap-3 w-full px-8 py-4 bg-blue-600 text-white font-medium transition-colors duration-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                )}
                <span>
                  {loading ? '処理中...' : '購入する'}
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

          {/* 右側: 購入するメリット */}
          <div className="bg-gray-50 p-8 md:p-10 md:w-72 border-t md:border-t-0 md:border-l border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">購入するメリット</h3>
            <ul className="text-sm text-gray-600 space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 flex-shrink-0">✓</span>
                <span>全ての有料コンテンツが見放題</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 flex-shrink-0">✓</span>
                <span>買い切りなので追加料金なし</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 flex-shrink-0">✓</span>
                <span>新しいコンテンツも追加料金なしで視聴可能</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 flex-shrink-0">✓</span>
                <span>何度でも繰り返し学習できます</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
