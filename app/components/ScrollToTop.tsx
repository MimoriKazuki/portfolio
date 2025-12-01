'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Safariかどうかを判定
function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua)
}

// 完全に最上部にスクロール（Safari対応）
function scrollToAbsoluteTop() {
  // 方法1: window.scrollTo
  window.scrollTo(0, 0)

  // 方法2: documentElement と body の両方
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  // 方法3: body要素を直接ビューに入れる
  document.body.scrollIntoView({ block: 'start', behavior: 'instant' })
}

// Safari用: 強制的に最上部にスクロール
function forceScrollToTopSafari() {
  // パディングを考慮して負の位置も試す
  window.scrollTo(0, -100)
  window.scrollTo(0, 0)

  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  // html要素を直接ビューに入れる
  document.documentElement.scrollIntoView({ block: 'start', behavior: 'instant' })
}

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // ブラウザの履歴スクロール復元を無効化
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    // Safari用: リンククリック時にスクロール状態をリセット
    if (isSafari()) {
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        const link = target.closest('a')

        if (link) {
          const href = link.getAttribute('href')
          // 内部リンクの場合のみ処理
          if (href && href.startsWith('/') && !href.includes('#')) {
            forceScrollToTopSafari()
          }
        }
      }

      document.addEventListener('click', handleClick, { capture: true })
      return () => document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [])

  // ページ遷移時にスクロール位置を一番上にリセット
  useEffect(() => {
    if (isSafari()) {
      // Safari: 複数のタイミングで強制スクロール
      forceScrollToTopSafari()
      setTimeout(forceScrollToTopSafari, 0)
      setTimeout(forceScrollToTopSafari, 10)
      setTimeout(forceScrollToTopSafari, 50)
      setTimeout(forceScrollToTopSafari, 100)
    } else {
      scrollToAbsoluteTop()
    }
  }, [pathname])

  return null
}
