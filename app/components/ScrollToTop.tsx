'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Safariかどうかを判定
function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua)
}

// Safari用: スクロール方向状態をリセット
// Safariは最後のスクロール方向を内部的に保持しており、
// これがページ遷移時に引き継がれることがある
function resetSafariScrollState() {
  const currentScroll = window.scrollY

  // スクロール位置を微小に変更してSafariの内部状態をリセット
  // 上に1pxスクロールしてから元に戻す
  if (currentScroll > 0) {
    window.scrollTo(0, currentScroll - 1)
  }
  window.scrollTo(0, 0)
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
            resetSafariScrollState()
          }
        }
      }

      document.addEventListener('click', handleClick, { capture: true })
      return () => document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [])

  // ページ遷移時にスクロール位置を一番上にリセット
  useEffect(() => {
    window.scrollTo(0, 0)

    // Safari用: 追加のリセット
    if (isSafari()) {
      setTimeout(() => window.scrollTo(0, 0), 10)
      setTimeout(() => window.scrollTo(0, 0), 50)
    }
  }, [pathname])

  return null
}
