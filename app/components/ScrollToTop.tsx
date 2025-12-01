'use client'

import { useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Safari対応のuseLayoutEffect
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default function ScrollToTop() {
  const pathname = usePathname()
  const isInitialMount = useRef(true)

  // スクロールをトップにリセットする関数
  const scrollToTop = useCallback(() => {
    // アンカー要素へのスクロール（iOS Safari対策）
    const pageTop = document.getElementById('page-top')
    if (pageTop) {
      pageTop.scrollIntoView({ behavior: 'instant', block: 'start' })
    }

    // 複数の方法でスクロールリセット
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    // scrollTo with options
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    } catch {
      window.scrollTo(0, 0)
    }
  }, [])

  // 初期化
  useEffect(() => {
    // ブラウザの履歴スクロール復元を無効化
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    // iOS Safari bfcache対応: pageshow イベント
    const handlePageShow = (event: PageTransitionEvent) => {
      // bfcacheから復元された場合は特に重要
      if (event.persisted) {
        scrollToTop()
        // Safari用の追加リセット
        requestAnimationFrame(() => {
          scrollToTop()
          setTimeout(scrollToTop, 50)
        })
      }
    }

    window.addEventListener('pageshow', handlePageShow)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [scrollToTop])

  // ページ遷移時にスクロール位置を一番上にリセット
  useIsomorphicLayoutEffect(() => {
    // 初回マウント時はスキップ（サーバーからの初期レンダリング時）
    if (isInitialMount.current) {
      isInitialMount.current = false
      // 初回でも確実にトップに
      scrollToTop()
      // Safari用の追加リセット（負のマージンによるズレ対策）
      requestAnimationFrame(() => {
        scrollToTop()
        setTimeout(scrollToTop, 100)
        setTimeout(scrollToTop, 300)
      })
      return
    }

    // ページ遷移時
    scrollToTop()
    requestAnimationFrame(() => {
      scrollToTop()
      setTimeout(scrollToTop, 100)
    })
  }, [pathname, scrollToTop])

  return null
}
