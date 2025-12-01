'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

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
      window.scrollTo(0, 0)

      // Safari対策: Safariの内部スクロール復元より後にリセット
      // 複数のタイミングで実行して確実にリセット
      const timers = [
        setTimeout(() => window.scrollTo(0, 0), 0),
        setTimeout(() => window.scrollTo(0, 0), 10),
        setTimeout(() => window.scrollTo(0, 0), 50),
        setTimeout(() => window.scrollTo(0, 0), 100),
      ]

      return () => timers.forEach(clearTimeout)
    }
  }, [pathname])

  return null
}
