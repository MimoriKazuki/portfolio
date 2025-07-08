'use client'

import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ContactButton() {
  const pathname = usePathname()
  
  // 問い合わせページでは非表示
  if (pathname === '/contact') {
    return null
  }
  
  return (
    <Link
      href="/contact"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 sm:p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50 group"
    >
      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-youtube-dark px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
        お問い合わせ
      </span>
    </Link>
  )
}