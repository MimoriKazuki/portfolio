'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Safari対応のスクロールリセット関数
function forceScrollToTop() {
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

// Safariのモメンタムスクロールを強制停止してからスクロールトップ
// 参照: https://stackoverflow.com/questions/16109561/
function stopMomentumAndScrollToTop() {
  const html = document.documentElement
  const body = document.body

  // overflow: hiddenを設定してモメンタムスクロールを強制停止
  const originalHtmlOverflow = html.style.overflow
  const originalBodyOverflow = body.style.overflow

  html.style.overflow = 'hidden'
  body.style.overflow = 'hidden'

  // スクロール位置をリセット
  forceScrollToTop()

  // 少し待ってからoverflowを元に戻す（10ms以上必要）
  setTimeout(() => {
    html.style.overflow = originalHtmlOverflow
    body.style.overflow = originalBodyOverflow
  }, 10)
}

export default function ScrollToTop() {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    // ブラウザの履歴スクロール復元を無効化
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    // リンククリック時にモメンタムスクロールを停止
    // Next.jsのナビゲーション前にモメンタムを止める
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (link) {
        const href = link.getAttribute('href')
        // 内部リンクの場合のみ処理
        if (href && (href.startsWith('/') || href.startsWith(window.location.origin))) {
          // ハッシュリンクでない場合
          if (!href.includes('#')) {
            // モメンタムスクロールを停止してからスクロールトップ
            stopMomentumAndScrollToTop()
          }
        }
      }
    }

    // キャプチャフェーズで実行（Next.jsより先に処理）
    document.addEventListener('click', handleClick, { capture: true })

    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [])

  // ページ遷移時にもスクロール位置をリセット
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname

      // モメンタム停止 + スクロールリセット
      stopMomentumAndScrollToTop()

      // 追加の遅延リセット（念のため）
      const timers = [
        setTimeout(forceScrollToTop, 50),
        setTimeout(forceScrollToTop, 100),
      ]

      return () => timers.forEach(clearTimeout)
    }
  }, [pathname])

  return null
}
