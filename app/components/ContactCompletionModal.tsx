'use client'

import { useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface ContactCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  type?: 'contact' | 'document' | 'prompt'
}

export default function ContactCompletionModal({ isOpen, onClose, type = 'contact' }: ContactCompletionModalProps) {
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
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-8 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="bg-green-100 rounded-full p-3 mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {type === 'document' ? '資料請求を受け付けました' : 
             type === 'prompt' ? 'プロンプトダウンロード完了' :
             'お問い合わせありがとうございます'}
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {type === 'document' ? (
              <>
                資料のダウンロードが完了しました。
                <br />
                ダウンロードフォルダをご確認ください。
              </>
            ) : type === 'prompt' ? (
              <>
                プロンプトのダウンロードが完了しました。
                <br />
                CSVファイルはダウンロードフォルダに保存されています。
              </>
            ) : (
              <>
                ご記入いただいた内容を確認次第、担当者よりご連絡させていただきます。
                <br />
                通常1~2営業日以内にお返事しておりますので、しばらくお待ちください。
              </>
            )}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {type !== 'prompt' && (
              <Link
                href="/documents"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors text-center"
              >
                他の資料を見る
              </Link>
            )}
            
            <button
              onClick={onClose}
              className={`${type === 'prompt' ? 'w-full' : 'flex-1'} bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-medium py-3 px-6 rounded-lg transition-colors`}
            >
              {type === 'document' ? 'トップに戻る' : 
               type === 'prompt' ? 'プロジェクトに戻る' : 
               'ホームに戻る'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}