'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * ページ遷移時にスクロール位置を最上部にリセットするコンポーネント
 *
 * Safari viewport バグ対策として、以下のCSS/レイアウト変更と併用:
 * - MobileHeader: position: fixed → sticky
 * - body: min-height: 100dvh 削除
 * - viewport: viewport-fit=cover 追加
 */
export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // ブラウザの履歴スクロール復元を無効化
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  // ページ遷移時にスクロール位置をリセット
  useEffect(() => {
    // 即座にスクロール位置を0に
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
