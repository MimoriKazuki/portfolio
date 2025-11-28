'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/app/components/MainLayout'
import { Suspense } from 'react'

function ThanksContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'contact'
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const isDocument = type === 'document'

  return (
    <div className="w-full flex justify-center px-4 py-12 md:py-16">
      <div
        className="w-full max-w-2xl"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}
      >
        {/* カード */}
        <div className="bg-white border border-gray-200 text-center" style={{ padding: '80px' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">THANK YOU</h1>
          <p className="text-lg text-gray-500 mb-8">
            {isDocument ? '資料請求ありがとうございます' : 'お問い合わせありがとうございます'}
          </p>

          <p className="text-gray-600 leading-relaxed mb-10">
            {isDocument ? (
              <>資料のダウンロードが完了しました。<br />ダウンロードフォルダをご確認ください。</>
            ) : (
              <>ご記入いただいた内容を確認次第、<br />担当者よりご連絡させていただきます。<br />通常1~2営業日以内にお返事しておりますので、<br />しばらくお待ちください。</>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isDocument ? (
              <Link
                href="/documents"
                className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                他の資料を見る
              </Link>
            ) : (
              <Link
                href="/services"
                className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                サービス一覧を見る
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              トップページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ThanksPage() {
  return (
    <MainLayout hideRightSidebar={true} hideContactButton={true}>
      <Suspense fallback={
        <div className="w-full flex justify-center px-4 py-12 md:py-16">
          <div className="w-full max-w-2xl">
            <div className="bg-white border border-gray-200 animate-pulse text-center" style={{ padding: '80px' }}>
              <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-4" />
              <div className="h-6 bg-gray-200 rounded w-48 mx-auto" />
            </div>
          </div>
        </div>
      }>
        <ThanksContent />
      </Suspense>
    </MainLayout>
  )
}
