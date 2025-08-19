'use client'

import { Mail } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ContactButton() {
  const pathname = usePathname()
  
  // 問い合わせページでは非表示
  if (pathname === '/contact') {
    return null
  }
  
  return (
    <div className="fixed bottom-6 right-4 md:right-6 z-30">
      <Link
        href="/contact"
        className="relative bg-[rgb(37,99,235)] hover:opacity-90 text-white px-6 md:px-8 py-3 md:py-4 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2 md:gap-3 overflow-visible"
      >
        {/* Ripple animations */}
        <span className="absolute inset-0 rounded-full bg-[rgb(37,99,235)] animate-ripple"></span>
        <span className="absolute inset-0 rounded-full bg-[rgb(37,99,235)] animate-ripple" style={{ animationDelay: '2.5s' }}></span>
        
        <Mail className="h-4 w-4 md:h-5 md:w-5 relative z-10" />
        <span className="text-sm md:text-base relative z-10 whitespace-nowrap">お問い合わせ</span>
      </Link>
    </div>
  )
}