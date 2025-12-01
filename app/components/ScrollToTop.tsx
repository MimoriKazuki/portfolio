'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Safariかどうかを判定
function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua)
}

// デバッグ情報を収集（開発環境のみ）
function logScrollDebugInfo(label: string) {
  if (process.env.NODE_ENV === 'development' && isSafari()) {
    const scrollY = window.scrollY
    const scrollTop = document.documentElement.scrollTop
    const bodyScrollTop = document.body.scrollTop
    
    console.log(`[Safari Scroll Debug] ${label}:`, {
      windowScrollY: scrollY,
      documentElementScrollTop: scrollTop,
      bodyScrollTop: bodyScrollTop,
      timestamp: Date.now()
    })
  }
}

// 完全に最上部にスクロール（非Safari用）
function scrollToAbsoluteTop() {
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  document.body.scrollIntoView({ block: 'start', behavior: 'instant' })
}

// Safari用: 強制的に最上部にスクロール
// スクロール方向をリセットするため、上方向にスクロールしてから0に戻す
function forceScrollToTopSafari() {
  const currentScroll = window.scrollY
  
  // スクロール位置が0でない場合、スクロール方向をリセット
  if (currentScroll > 0) {
    // 1px上にスクロール（スクロール方向をリセット）
    window.scrollTo(0, currentScroll - 1)
    document.documentElement.scrollTop = currentScroll - 1
    document.body.scrollTop = currentScroll - 1
  }
  
  // 即座に0に戻す
  requestAnimationFrame(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    
    // さらに確実にするため、もう一度リセット
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    })
  })
}

export default function ScrollToTop() {
  const pathname = usePathname()
  const isNavigatingRef = useRef(false)
  const scrollResetTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    // ブラウザの履歴スクロール復元を無効化
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    if (!isSafari()) {
      return
    }

    // Safari用: リンククリック時にスクロール位置を即座にリセット（遷移前）
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (link) {
        const href = link.getAttribute('href')
        // 内部リンクでアンカーリンクでない場合のみ処理
        if (href && href.startsWith('/') && !href.includes('#')) {
          logScrollDebugInfo('Link click detected - Resetting scroll before navigation')
          isNavigatingRef.current = true
          
          // 遷移前に即座にスクロール位置をリセット
          forceScrollToTopSafari()
        }
      }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [])

  // ページ遷移時にスクロール位置をリセット
  useEffect(() => {
    if (!isSafari()) {
      scrollToAbsoluteTop()
      return
    }

    logScrollDebugInfo(`Pathname changed to: ${pathname}`)
    isNavigatingRef.current = true

    // 既存のタイムアウトとRAFをクリア
    if (scrollResetTimeoutRef.current) {
      clearTimeout(scrollResetTimeoutRef.current)
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
    }

    // 即座にスクロール位置をリセット
    forceScrollToTopSafari()

    // ページ遷移直後の短時間（200ms）だけ、スクロール位置を監視してリセット
    // ただし、ユーザーがスクロールを開始したら即座に停止
    const userScrolledRef = { current: false }
    let lastScrollY = window.scrollY
    const startTime = Date.now()
    const monitorDuration = 200 // 200ms間のみ監視

    const checkAndReset = () => {
      const elapsed = Date.now() - startTime
      const currentScrollY = window.scrollY

      // ユーザーが意図的にスクロールしている場合は停止
      // スクロール位置が5px以上変化した場合、ユーザーの操作と判断
      if (Math.abs(currentScrollY - lastScrollY) > 5) {
        userScrolledRef.current = true
        isNavigatingRef.current = false
        logScrollDebugInfo('User scroll detected - Stopping monitor')
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current)
          rafIdRef.current = null
        }
        return
      }
      lastScrollY = currentScrollY

      // 監視期間内で、ユーザーがスクロールしていない場合のみリセット
      if (elapsed < monitorDuration && !userScrolledRef.current && isNavigatingRef.current) {
        const scrollY = window.scrollY
        const scrollTop = document.documentElement.scrollTop
        const bodyScrollTop = document.body.scrollTop

        // スクロール位置が0でない場合、リセット
        if (scrollY > 0 || scrollTop > 0 || bodyScrollTop > 0) {
          forceScrollToTopSafari()
          logScrollDebugInfo(`RAF Monitor (${elapsed}ms) - Reset triggered`)
        }

        rafIdRef.current = requestAnimationFrame(checkAndReset)
      } else {
        // 監視終了
        isNavigatingRef.current = false
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current)
          rafIdRef.current = null
        }
      }
    }

    // 監視を開始
    rafIdRef.current = requestAnimationFrame(checkAndReset)

    // タイムアウトで強制終了
    scrollResetTimeoutRef.current = setTimeout(() => {
      isNavigatingRef.current = false
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }, monitorDuration + 100)

    // 複数のタイミングでもリセット（フォールバック）
    // ただし、ユーザーがスクロールを開始したら実行しない
    const timeouts = [
      setTimeout(() => {
        if (!userScrolledRef.current && isNavigatingRef.current) {
          forceScrollToTopSafari()
          logScrollDebugInfo('Timeout 0ms')
        }
      }, 0),
      setTimeout(() => {
        if (!userScrolledRef.current && isNavigatingRef.current) {
          forceScrollToTopSafari()
          logScrollDebugInfo('Timeout 50ms')
        }
      }, 50),
      setTimeout(() => {
        if (!userScrolledRef.current && isNavigatingRef.current) {
          forceScrollToTopSafari()
          logScrollDebugInfo('Timeout 100ms')
        }
      }, 100),
      setTimeout(() => {
        if (!userScrolledRef.current && isNavigatingRef.current) {
          forceScrollToTopSafari()
          logScrollDebugInfo('Timeout 200ms')
        }
        isNavigatingRef.current = false
      }, 200)
    ]

    return () => {
      isNavigatingRef.current = false
      if (scrollResetTimeoutRef.current) {
        clearTimeout(scrollResetTimeoutRef.current)
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      timeouts.forEach(clearTimeout)
    }
  }, [pathname])

  return null
}
