'use client'

import { useEffect } from 'react'
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
    const visualViewport = window.visualViewport
    const viewportOffsetTop = visualViewport ? visualViewport.offsetTop : 0
    const viewportPageTop = visualViewport ? visualViewport.pageTop : 0
    
    console.log(`[Safari Scroll Debug] ${label}:`, {
      windowScrollY: scrollY,
      documentElementScrollTop: scrollTop,
      bodyScrollTop: bodyScrollTop,
      visualViewportOffsetTop: viewportOffsetTop,
      visualViewportPageTop: viewportPageTop,
      windowInnerHeight: window.innerHeight,
      documentElementClientHeight: document.documentElement.clientHeight,
      timestamp: Date.now()
    })
  }
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

// Safari用: 強制的に最上部にスクロール（従来の方法）
function forceScrollToTopSafari() {
  // パディングを考慮して負の位置も試す
  window.scrollTo(0, -100)
  window.scrollTo(0, 0)

  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  // html要素を直接ビューに入れる
  document.documentElement.scrollIntoView({ block: 'start', behavior: 'instant' })
}

// アプローチ1: Visual Viewport APIを使用したスクロール位置制御
function scrollToTopWithVisualViewport() {
  if (window.visualViewport) {
    // Visual Viewport APIが利用可能な場合
    const scrollTop = window.visualViewport.pageTop
    if (scrollTop > 0) {
      window.scrollTo(0, 0)
      // visualViewportのoffsetTopもリセット
      if (window.visualViewport.offsetTop > 0) {
        window.scrollTo(0, -window.visualViewport.offsetTop)
        window.scrollTo(0, 0)
      }
    }
  }
  
  // フォールバック: 従来の方法も実行
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  document.documentElement.scrollIntoView({ block: 'start', behavior: 'instant' })
}

// アプローチ3: requestAnimationFrameループでの監視とリセット
function createScrollMonitor(duration: number = 500) {
  let rafId: number | null = null
  let timeoutId: NodeJS.Timeout | null = null
  const startTime = Date.now()
  
  const checkAndReset = () => {
    const elapsed = Date.now() - startTime
    
    if (elapsed < duration) {
      const scrollY = window.scrollY
      const scrollTop = document.documentElement.scrollTop
      const bodyScrollTop = document.body.scrollTop
      
      // スクロール位置が0でない場合、強制的に0にリセット
      if (scrollY > 0 || scrollTop > 0 || bodyScrollTop > 0) {
        scrollToTopWithVisualViewport()
        logScrollDebugInfo(`RAF Monitor (${elapsed}ms) - Reset triggered`)
      }
      
      rafId = requestAnimationFrame(checkAndReset)
    } else {
      // 最終確認
      const finalScrollY = window.scrollY
      const finalScrollTop = document.documentElement.scrollTop
      if (finalScrollY > 0 || finalScrollTop > 0) {
        scrollToTopWithVisualViewport()
        logScrollDebugInfo(`RAF Monitor (final) - Reset triggered`)
      }
      
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }
  
  rafId = requestAnimationFrame(checkAndReset)
  
  // タイムアウトで強制終了
  timeoutId = setTimeout(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }
  }, duration + 100)
  
  return () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
  }
}

// アプローチ4: MutationObserverによるDOM監視
function createDOMObserver(onContentReady: () => void) {
  let observer: MutationObserver | null = null
  let timeoutId: NodeJS.Timeout | null = null
  
  const checkContentReady = () => {
    // メインコンテンツがレンダリングされているか確認
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]')
    if (mainContent && mainContent.children.length > 0) {
      onContentReady()
      if (observer) {
        observer.disconnect()
        observer = null
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
  }
  
  // MutationObserverでDOM変更を監視
  observer = new MutationObserver(() => {
    checkContentReady()
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
  
  // タイムアウトで強制実行（500ms後）
  timeoutId = setTimeout(() => {
    onContentReady()
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }, 500)
  
  // 初回チェック
  checkContentReady()
  
  return () => {
    if (observer) {
      observer.disconnect()
    }
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
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
            logScrollDebugInfo('Link click detected')
            // アプローチ1: Visual Viewport APIを使用
            scrollToTopWithVisualViewport()
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
      logScrollDebugInfo(`Pathname changed to: ${pathname}`)
      
      // アプローチ1: Visual Viewport APIを使用した即座のリセット
      scrollToTopWithVisualViewport()
      
      // アプローチ3: requestAnimationFrameループでの監視
      const cleanupRAF = createScrollMonitor(500)
      
      // アプローチ4: MutationObserverによるDOM監視
      const cleanupObserver = createDOMObserver(() => {
        logScrollDebugInfo('DOM content ready')
        scrollToTopWithVisualViewport()
      })
      
      // 複数のタイミングでもリセット（フォールバック）
      const timeouts = [
        setTimeout(() => {
          scrollToTopWithVisualViewport()
          logScrollDebugInfo('Timeout 0ms')
        }, 0),
        setTimeout(() => {
          scrollToTopWithVisualViewport()
          logScrollDebugInfo('Timeout 10ms')
        }, 10),
        setTimeout(() => {
          scrollToTopWithVisualViewport()
          logScrollDebugInfo('Timeout 50ms')
        }, 50),
        setTimeout(() => {
          scrollToTopWithVisualViewport()
          logScrollDebugInfo('Timeout 100ms')
        }, 100),
        setTimeout(() => {
          scrollToTopWithVisualViewport()
          logScrollDebugInfo('Timeout 200ms')
        }, 200)
      ]
      
      return () => {
        cleanupRAF()
        cleanupObserver()
        timeouts.forEach(clearTimeout)
      }
    } else {
      scrollToAbsoluteTop()
    }
  }, [pathname])

  // Visual Viewport APIのresizeイベントを監視（Safari専用）
  useEffect(() => {
    if (isSafari() && window.visualViewport) {
      const handleResize = () => {
        const scrollY = window.scrollY
        const pageTop = window.visualViewport?.pageTop || 0
        
        // スクロール位置が0でない場合、リセット
        if (scrollY > 0 || pageTop > 0) {
          scrollToTopWithVisualViewport()
          logScrollDebugInfo('Visual viewport resize - Reset triggered')
        }
      }
      
      window.visualViewport.addEventListener('resize', handleResize)
      window.visualViewport.addEventListener('scroll', handleResize)
      
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize)
        window.visualViewport?.removeEventListener('scroll', handleResize)
      }
    }
  }, [])

  return null
}
