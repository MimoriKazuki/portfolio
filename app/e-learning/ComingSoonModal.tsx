'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Clock } from 'lucide-react'

interface ComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
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
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                準備中です
              </h2>
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">
              eラーニングコンテンツは現在準備中です。<br />
              近日中に公開予定ですので、もうしばらくお待ちください。
            </p>

            <div className="space-y-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full px-8 py-4 bg-blue-600 text-white font-medium transition-colors duration-200 hover:bg-blue-700"
              >
                トップページに戻る
              </Link>

              <button
                onClick={onClose}
                className="inline-flex items-center justify-center w-full px-8 py-4 bg-white text-gray-700 font-medium border border-gray-300 transition-colors duration-200 hover:bg-gray-50"
              >
                閉じる
              </button>
            </div>
          </div>

          {/* 右側: 今後の予定 */}
          <div className="bg-gray-50 p-8 md:p-10 md:w-72 border-t md:border-t-0 md:border-l border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">公開予定のコンテンツ</h3>
            <ul className="text-sm text-gray-600 space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 flex-shrink-0">✓</span>
                <span>バイブコーディング入門</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 flex-shrink-0">✓</span>
                <span>AI駆動開発の基礎</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5 flex-shrink-0">✓</span>
                <span>実践的なプロンプト設計</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
