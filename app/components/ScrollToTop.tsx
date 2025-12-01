'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Safari対応のスクロールリセット関数
function forceScrollToTop() {
  // 方法1: 標準的なscrollTo
  window.scrollTo(0, 0)

  // 方法2: documentElementとbodyの両方をリセット
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  // 方法3: Safari用の負の値ワークアラウンド
  // Safariでは0が効かない場合があるため、-1を使用してから0に戻す
  // 参照: https://stackoverflow.com/questions/24616322/
  try {
    window.scroll({ top: -1, left: 0, behavior: 'instant' })
    window.scroll({ top: 0, left: 0, behavior: 'instant' })
  } catch {
    // behavior: 'instant'がサポートされていない場合
    window.scrollTo(0, 0)
  }
}

export default function ScrollToTop() {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    // ブラウザの履歴スクロール復元を無効化
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  // ページ遷移時にスクロール位置を一番上にリセット
  useEffect(() => {
    // パスが変わった場合のみ実行
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname

      // 即座にスクロールリセット
      forceScrollToTop()

      // Safari対策: Safariの内部スクロール復元より後にリセット
      // 複数のタイミングで実行して確実にリセット
      const timers = [
        setTimeout(forceScrollToTop, 0),
        setTimeout(forceScrollToTop, 10),
        setTimeout(forceScrollToTop, 50),
        setTimeout(forceScrollToTop, 100),
        setTimeout(forceScrollToTop, 200), // 追加: 長めの遅延
      ]

      return () => timers.forEach(clearTimeout)
    }
  }, [pathname])

  return null
}
