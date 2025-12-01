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

// Safari用: スクロール方向を完全にリセットする強力な関数
// 下方向スクロール状態を上方向に変更してから0に戻す
function resetScrollDirectionSafari() {
  const currentScroll = window.scrollY
  
  // スクロール位置が0でない場合、スクロール方向を完全にリセット
  if (currentScroll > 0) {
    // ステップ1: 現在位置から上方向に10pxスクロール（スクロール方向を上方向に変更）
    const targetScroll = Math.max(0, currentScroll - 10)
    window.scrollTo(0, targetScroll)
    document.documentElement.scrollTop = targetScroll
    document.body.scrollTop = targetScroll
    
    // ステップ2: さらに上方向にスクロール（確実に上方向状態にする）
    requestAnimationFrame(() => {
      const newTargetScroll = Math.max(0, targetScroll - 20)
      window.scrollTo(0, newTargetScroll)
      document.documentElement.scrollTop = newTargetScroll
      document.body.scrollTop = newTargetScroll
      
      // ステップ3: 0に戻す（上方向状態を保ったまま）
      requestAnimationFrame(() => {
        window.scrollTo(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
        
        // ステップ4: 最終確認（確実に0に）
        requestAnimationFrame(() => {
          window.scrollTo(0, 0)
          document.documentElement.scrollTop = 0
          document.body.scrollTop = 0
        })
      })
    })
  } else {
    // 既に0の場合は、上方向にスクロールしてから0に戻す（スクロール方向をリセット）
    window.scrollTo(0, -5)
    document.documentElement.scrollTop = -5
    document.body.scrollTop = -5
    
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    })
  }
}

export default function ScrollToTop() {
  const pathname = usePathname()
  const isNavigatingRef = useRef(false)
  const scrollResetTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    // ブラウザの履歴スクロール復元を無効化
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    if (!isSafari()) {
      return
    }

    // Safari用: リンククリック時にスクロール方向を完全にリセット（遷移前）
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (link) {
        const href = link.getAttribute('href')
        // 内部リンクでアンカーリンクでない場合のみ処理
        if (href && href.startsWith('/') && !href.includes('#')) {
          logScrollDebugInfo('Link click detected - Resetting scroll direction before navigation')
          isNavigatingRef.current = true
          
          // 遷移前にスクロール方向を完全にリセット（即座に実行）
          resetScrollDirectionSafari()
          
          // さらに確実にするため、短い遅延後にもう一度リセット
          setTimeout(() => {
            resetScrollDirectionSafari()
          }, 10)
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
    lastScrollYRef.current = window.scrollY

    // 既存のタイムアウトとRAFをクリア
    if (scrollResetTimeoutRef.current) {
      clearTimeout(scrollResetTimeoutRef.current)
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
    }

    // 即座にスクロール方向を完全にリセット
    resetScrollDirectionSafari()

    // 遷移完了後、スクロール位置を強制的に0に保つ（500ms間）
    const monitorDuration = 500
    let checkCount = 0
    const maxChecks = 50 // 最大50回チェック（約500ms）

    const checkAndReset = () => {
      checkCount++
      
      // スクロール位置が0でない場合、強制的に0にリセット
      const scrollY = window.scrollY
      const scrollTop = document.documentElement.scrollTop
      const bodyScrollTop = document.body.scrollTop

      if (scrollY > 0 || scrollTop > 0 || bodyScrollTop > 0) {
        // スクロール方向をリセットしてから0に戻す
        resetScrollDirectionSafari()
        logScrollDebugInfo(`RAF Monitor (check ${checkCount}) - Reset triggered`)
      }

      // ユーザーが意図的にスクロールしている場合は停止
      const currentScrollY = window.scrollY
      if (Math.abs(currentScrollY - lastScrollYRef.current) > 10 && currentScrollY > 20) {
        // ユーザーが20px以上スクロールした場合、監視を停止
        isNavigatingRef.current = false
        logScrollDebugInfo('User scroll detected (>20px) - Stopping monitor')
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current)
          rafIdRef.current = null
        }
        return
      }
      
      lastScrollYRef.current = currentScrollY

      // 監視期間内で、まだナビゲーション中の場合のみ継続
      if (checkCount < maxChecks && isNavigatingRef.current) {
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
    const timeouts = [
      setTimeout(() => {
        if (isNavigatingRef.current) {
          resetScrollDirectionSafari()
          logScrollDebugInfo('Timeout 0ms')
        }
      }, 0),
      setTimeout(() => {
        if (isNavigatingRef.current) {
          resetScrollDirectionSafari()
          logScrollDebugInfo('Timeout 50ms')
        }
      }, 50),
      setTimeout(() => {
        if (isNavigatingRef.current) {
          resetScrollDirectionSafari()
          logScrollDebugInfo('Timeout 100ms')
        }
      }, 100),
      setTimeout(() => {
        if (isNavigatingRef.current) {
          resetScrollDirectionSafari()
          logScrollDebugInfo('Timeout 200ms')
        }
      }, 200),
      setTimeout(() => {
        if (isNavigatingRef.current) {
          resetScrollDirectionSafari()
          logScrollDebugInfo('Timeout 300ms')
        }
        isNavigatingRef.current = false
      }, 300)
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
