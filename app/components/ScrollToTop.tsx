'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Safariかどうかを判定
function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua)
}

// デバッグ情報を収集（開発環境のみ）
function logScrollDebugInfo(label: string, extra?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development' && isSafari()) {
    const scrollY = window.scrollY
    const scrollTop = document.documentElement.scrollTop
    const bodyScrollTop = document.body.scrollTop
    const visualViewport = window.visualViewport

    console.log(`[Safari Scroll Debug] ${label}:`, {
      windowScrollY: scrollY,
      documentElementScrollTop: scrollTop,
      bodyScrollTop: bodyScrollTop,
      visualViewportPageTop: visualViewport?.pageTop || 0,
      visualViewportOffsetTop: visualViewport?.offsetTop || 0,
      documentReadyState: document.readyState,
      timestamp: Date.now(),
      ...extra
    })
  }
}

/**
 * 複数の方法でスクロール位置を0にリセット（最も強力な方法）
 * Safari固有の問題に対応するため、複数のAPIを使用
 */
function forceScrollToTopAllMethods(): void {
  // Method 1: window.scrollTo with instant behavior
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

  // Method 2: scrollTop直接設定
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  // Method 3: scrollTo on document elements
  if (document.documentElement.scrollTo) {
    document.documentElement.scrollTo(0, 0)
  }
  if (document.body.scrollTo) {
    document.body.scrollTo(0, 0)
  }

  // Method 4: scrollIntoView（最上部の要素がある場合）
  const topElement = document.body.firstElementChild
  if (topElement && topElement.scrollIntoView) {
    topElement.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
}

// 完全に最上部にスクロール（非Safari用）
function scrollToAbsoluteTop() {
  forceScrollToTopAllMethods()
}

// Safari用: スクロール方向を完全にリセットする強力な関数
// 下方向スクロール状態を上方向に変更してから0に戻す
// 戻り値: Promise（リセット処理の完了を待機可能）
function resetScrollDirectionSafari(): Promise<void> {
  return new Promise((resolve) => {
    const currentScroll = window.scrollY
    const startTime = performance.now()
    
    logScrollDebugInfo('resetScrollDirectionSafari - Start', { currentScroll })
    
    // スクロール位置が0でない場合、スクロール方向を完全にリセット
    if (currentScroll > 0) {
      // ステップ1: 現在位置から上方向に10pxスクロール（スクロール方向を上方向に変更）
      const targetScroll = Math.max(0, currentScroll - 10)
      window.scrollTo(0, targetScroll)
      document.documentElement.scrollTop = targetScroll
      document.body.scrollTop = targetScroll
      
      logScrollDebugInfo('resetScrollDirectionSafari - Step 1', { targetScroll })
      
      // ステップ2: さらに上方向にスクロール（確実に上方向状態にする）
      requestAnimationFrame(() => {
        const newTargetScroll = Math.max(0, targetScroll - 20)
        window.scrollTo(0, newTargetScroll)
        document.documentElement.scrollTop = newTargetScroll
        document.body.scrollTop = newTargetScroll
        
        logScrollDebugInfo('resetScrollDirectionSafari - Step 2', { newTargetScroll })
        
        // ステップ3: 0に戻す（上方向状態を保ったまま）
        requestAnimationFrame(() => {
          window.scrollTo(0, 0)
          document.documentElement.scrollTop = 0
          document.body.scrollTop = 0
          
          logScrollDebugInfo('resetScrollDirectionSafari - Step 3', { scrollY: window.scrollY })
          
          // ステップ4: 最終確認（確実に0に）
          requestAnimationFrame(() => {
            window.scrollTo(0, 0)
            document.documentElement.scrollTop = 0
            document.body.scrollTop = 0
            
            const endTime = performance.now()
            logScrollDebugInfo('resetScrollDirectionSafari - Complete', { 
              finalScrollY: window.scrollY,
              duration: endTime - startTime
            })
            resolve()
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
        
        const endTime = performance.now()
        logScrollDebugInfo('resetScrollDirectionSafari - Complete (was at 0)', { 
          finalScrollY: window.scrollY,
          duration: endTime - startTime
        })
        resolve()
      })
    }
  })
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
    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (link) {
        const href = link.getAttribute('href')
        // 内部リンクでアンカーリンクでない場合のみ処理
        if (href && href.startsWith('/') && !href.includes('#')) {
          const clickTime = performance.now()
          logScrollDebugInfo('Link click detected - Resetting scroll direction before navigation', {
            href,
            currentPathname: window.location.pathname,
            clickTime,
            currentScrollY: window.scrollY
          })
          
          isNavigatingRef.current = true
          
          // 遷移前にスクロール方向を完全にリセット（完了を待機）
          try {
            // 即座に同期処理でスクロール位置を0に
            window.scrollTo(0, 0)
            document.documentElement.scrollTop = 0
            document.body.scrollTop = 0
            
            // 非同期でスクロール方向をリセット
            await resetScrollDirectionSafari()
            logScrollDebugInfo('Link click - First reset complete', {
              duration: performance.now() - clickTime,
              finalScrollY: window.scrollY
            })
            
            // さらに確実にするため、短い遅延後にもう一度リセット
            await new Promise(resolve => setTimeout(resolve, 10))
            await resetScrollDirectionSafari()
            logScrollDebugInfo('Link click - Second reset complete', {
              duration: performance.now() - clickTime,
              finalScrollY: window.scrollY
            })
            
            // 最終確認: スクロール位置が0であることを確認
            if (window.scrollY > 0) {
              logScrollDebugInfo('Link click - Final check: scrollY > 0, resetting again', {
                scrollY: window.scrollY
              })
              await resetScrollDirectionSafari()
            }
          } catch (error) {
            logScrollDebugInfo('Link click - Reset error', { error })
          }
        }
      }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [])

  // Safari用: useLayoutEffectで描画前に即座にスクロールをリセット
  // useLayoutEffectはDOM変更後、ブラウザが描画する前に同期的に実行される
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return

    // 即座にスクロール位置をリセット（描画前）
    forceScrollToTopAllMethods()

    if (isSafari()) {
      logScrollDebugInfo('useLayoutEffect - Immediate scroll reset', {
        pathname,
        scrollY: window.scrollY
      })

      // Safari専用: スクロールジョルト
      // 1pxスクロールしてから0に戻すことで、Safariのビューポートを強制的に再計算
      // これによりアドレスバーの状態がリセットされる
      const performScrollJolt = () => {
        window.scrollTo(0, 1)
        requestAnimationFrame(() => {
          window.scrollTo(0, 0)
          document.documentElement.scrollTop = 0
          document.body.scrollTop = 0
          logScrollDebugInfo('Scroll jolt completed', { scrollY: window.scrollY })
        })
      }

      // 即座にジョルト実行
      performScrollJolt()

      // 少し遅延してもう一度（アドレスバーアニメーション完了後）
      setTimeout(performScrollJolt, 100)
      setTimeout(performScrollJolt, 300)
    }
  }, [pathname])

  // ページ遷移時にスクロール位置をリセット
  useEffect(() => {
    if (!isSafari()) {
      scrollToAbsoluteTop()
      return
    }

    const pathnameChangeTime = performance.now()
    logScrollDebugInfo(`Pathname changed to: ${pathname}`, {
      pathnameChangeTime,
      documentReadyState: document.readyState,
      currentScrollY: window.scrollY
    })

    isNavigatingRef.current = true
    lastScrollYRef.current = window.scrollY

    // 既存のタイムアウトとRAFをクリア
    if (scrollResetTimeoutRef.current) {
      clearTimeout(scrollResetTimeoutRef.current)
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
    }

    // DOMのレンダリング完了を待ってからスクロール方向をリセット
    const resetAfterDOMReady = async () => {
      // DOMContentLoadedを待つ（既に完了している場合は即座に実行）
      if (document.readyState === 'loading') {
        await new Promise<void>((resolve) => {
          document.addEventListener('DOMContentLoaded', () => resolve(), { once: true })
        })
      }
      
      // さらに短い遅延を追加（DOMのレンダリングを待つ）
      await new Promise<void>((resolve) => setTimeout(resolve, 0))
      
      logScrollDebugInfo('Pathname change - DOM ready, resetting scroll', {
        duration: performance.now() - pathnameChangeTime,
        scrollY: window.scrollY
      })
      
      // スクロール方向を完全にリセット
      await resetScrollDirectionSafari()
      
      logScrollDebugInfo('Pathname change - Reset complete', {
        duration: performance.now() - pathnameChangeTime,
        finalScrollY: window.scrollY
      })
    }
    
    resetAfterDOMReady()

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
        resetScrollDirectionSafari().then(() => {
          logScrollDebugInfo(`RAF Monitor (check ${checkCount}) - Reset triggered and completed`)
        })
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
      setTimeout(async () => {
        if (isNavigatingRef.current) {
          await resetScrollDirectionSafari()
          logScrollDebugInfo('Timeout 0ms - Reset complete')
        }
      }, 0),
      setTimeout(async () => {
        if (isNavigatingRef.current) {
          await resetScrollDirectionSafari()
          logScrollDebugInfo('Timeout 50ms - Reset complete')
        }
      }, 50),
      setTimeout(async () => {
        if (isNavigatingRef.current) {
          await resetScrollDirectionSafari()
          logScrollDebugInfo('Timeout 100ms - Reset complete')
        }
      }, 100),
      setTimeout(async () => {
        if (isNavigatingRef.current) {
          await resetScrollDirectionSafari()
          logScrollDebugInfo('Timeout 200ms - Reset complete')
        }
      }, 200),
      setTimeout(async () => {
        if (isNavigatingRef.current) {
          await resetScrollDirectionSafari()
          logScrollDebugInfo('Timeout 300ms - Reset complete')
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
