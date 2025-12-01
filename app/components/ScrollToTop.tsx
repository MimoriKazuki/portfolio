'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // ブラウザの履歴スクロール復元を無効化
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  // ページ遷移時にスクロール位置を一番上にリセット
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
