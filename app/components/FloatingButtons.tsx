'use client'

import { Mail, FileText } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function FloatingButtons() {
  const pathname = usePathname()
  
  // トップページではフローティングボタンを非表示
  if (pathname === '/') {
    return null
  }
  
  // 問い合わせページでは問い合わせボタンを非表示
  const hideContactButton = pathname === '/contact'
  // 資料請求ページでは資料請求ボタンを非表示
  const hideDocumentButton = pathname.startsWith('/documents')
  
  // 両方非表示の場合はコンポーネント自体を非表示
  if (hideContactButton && hideDocumentButton) {
    return null
  }
  
  return (
    <div className="fixed bottom-6 right-4 md:right-6 z-30 flex gap-3">
      {/* 資料請求ボタン */}
      {!hideDocumentButton && (
        <Link
          href="/documents"
          className="relative bg-gray-700 hover:bg-gray-800 text-white px-5 md:px-6 py-3 md:py-4 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2 md:gap-3"
        >
          <FileText className="h-4 w-4 md:h-5 md:w-5" />
          <span className="text-sm md:text-base whitespace-nowrap">資料請求</span>
        </Link>
      )}
      
      {/* お問い合わせボタン */}
      {!hideContactButton && (
        <Link
          href="/contact"
          className="relative bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white px-5 md:px-6 py-3 md:py-4 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2 md:gap-3 overflow-visible"
        >
          {/* Ripple animations */}
          <span className="absolute inset-0 rounded-full bg-[rgb(37,99,235)] animate-ripple"></span>
          <span className="absolute inset-0 rounded-full bg-[rgb(37,99,235)] animate-ripple" style={{ animationDelay: '2.5s' }}></span>
          
          <Mail className="h-4 w-4 md:h-5 md:w-5 relative z-10" />
          <span className="text-sm md:text-base relative z-10 whitespace-nowrap">お問い合わせ</span>
        </Link>
      )}
    </div>
  )
}