'use client'

import { useEffect, useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'

// Safari対応のuseLayoutEffect
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default function ScrollToTop() {
  const pathname = usePathname()

  // ブラウザの履歴スクロール復元を無効化
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  // ページ遷移時にスクロール位置を一番上にリセット
  useIsomorphicLayoutEffect(() => {
    // 複数の方法でスクロールをリセット（Safari対応）
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    // Safari用の遅延リセット
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    })
  }, [pathname])

  return null
}
