'use client'

import { useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Safari対応のuseLayoutEffect
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default function ScrollToTop() {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  // スクロールをトップにリセットする関数
  const scrollToTop = useCallback(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  // 初期化
  useEffect(() => {
    // ブラウザの履歴スクロール復元を無効化
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    // 内部リンククリック時にスクロールをリセット（iOS Safari対策）
    // Next.jsのクライアントサイドナビゲーション前にスクロール位置をリセット
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const link = target.closest('a')

      if (link) {
        const href = link.getAttribute('href')
        // 内部リンクの場合のみ処理
        if (href && (href.startsWith('/') || href.startsWith(window.location.origin))) {
          // ハッシュリンク以外の場合
          if (!href.includes('#') || href.split('#')[0] !== window.location.pathname) {
            // ナビゲーション前にスクロールをリセット
            scrollToTop()
          }
        }
      }
    }

    // キャプチャフェーズで実行して、Next.jsのナビゲーションより先に処理
    document.addEventListener('click', handleLinkClick, { capture: true })

    // iOS Safari bfcache対応
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        scrollToTop()
        requestAnimationFrame(scrollToTop)
      }
    }

    window.addEventListener('pageshow', handlePageShow)

    return () => {
      document.removeEventListener('click', handleLinkClick, { capture: true })
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [scrollToTop])

  // ページ遷移時にスクロール位置を一番上にリセット
  useIsomorphicLayoutEffect(() => {
    // パスが変わった場合のみリセット
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname
      // 即座にリセット
      scrollToTop()
      // Safari用の追加リセット（複数タイミング）
      requestAnimationFrame(() => {
        scrollToTop()
        setTimeout(scrollToTop, 0)
        setTimeout(scrollToTop, 50)
      })
    }
  }, [pathname, scrollToTop])

  // 初回マウント時
  useEffect(() => {
    scrollToTop()
    requestAnimationFrame(scrollToTop)
  }, [scrollToTop])

  return null
}
