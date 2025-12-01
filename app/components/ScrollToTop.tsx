'use client'

import { useEffect, useLayoutEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

// Safari対応のuseLayoutEffect
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default function ScrollToTop() {
  const pathname = usePathname()

  // スクロールをトップにリセットする関数
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  // ブラウザの履歴スクロール復元を無効化
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    // iOS Safari bfcache対応: pageshow イベント
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // bfcacheから復元された場合
        scrollToTop()
      }
    }

    // visibilitychange イベント（タブ切り替え対応）
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 少し遅延してスクロールリセット
        setTimeout(scrollToTop, 0)
      }
    }

    window.addEventListener('pageshow', handlePageShow)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [scrollToTop])

  // ページ遷移時にスクロール位置を一番上にリセット
  useIsomorphicLayoutEffect(() => {
    // 即座にスクロールリセット
    scrollToTop()

    // Safari用の遅延リセット（複数タイミング）
    requestAnimationFrame(scrollToTop)
    setTimeout(scrollToTop, 0)
    setTimeout(scrollToTop, 50)
    setTimeout(scrollToTop, 100)
  }, [pathname, scrollToTop])

  return null
}
