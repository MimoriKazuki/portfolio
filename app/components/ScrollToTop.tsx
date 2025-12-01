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
// ページ遷移時のみに使用することを想定
function scrollToTopWithVisualViewport() {
  if (window.visualViewport) {
    // Visual Viewport APIが利用可能な場合
    const scrollTop = window.visualViewport.pageTop
    const offsetTop = window.visualViewport.offsetTop
    
    // スクロール位置が0でない場合のみリセット
    if (scrollTop > 0 || offsetTop > 0) {
      window.scrollTo(0, 0)
      // visualViewportのoffsetTopもリセット
      if (offsetTop > 0) {
        window.scrollTo(0, -offsetTop)
        window.scrollTo(0, 0)
      }
    }
  }
  
  // フォールバック: 従来の方法も実行（スクロール位置が0でない場合のみ）
  const currentScrollY = window.scrollY
  const currentScrollTop = document.documentElement.scrollTop
  const currentBodyScrollTop = document.body.scrollTop
  
  if (currentScrollY > 0 || currentScrollTop > 0 || currentBodyScrollTop > 0) {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    document.documentElement.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
}

// アプローチ3: requestAnimationFrameループでの監視とリセット
// ページ遷移直後のみ動作し、ユーザーがスクロールを開始したら停止
function createScrollMonitor(duration: number = 500) {
  let rafId: number | null = null
  let timeoutId: NodeJS.Timeout | null = null
  const startTime = Date.now()
  let lastScrollY = window.scrollY
  let userScrolled = false
  
  const checkAndReset = () => {
    const elapsed = Date.now() - startTime
    const currentScrollY = window.scrollY
    
    // ユーザーが意図的にスクロールしている場合は停止
    if (Math.abs(currentScrollY - lastScrollY) > 5) {
      userScrolled = true
    }
    lastScrollY = currentScrollY
    
    if (elapsed < duration && !userScrolled) {
      const scrollY = window.scrollY
      const scrollTop = document.documentElement.scrollTop
      const bodyScrollTop = document.body.scrollTop
      
      // スクロール位置が0でない場合、強制的に0にリセット
      // ただし、ユーザーがスクロールを開始していない場合のみ
      if ((scrollY > 0 || scrollTop > 0 || bodyScrollTop > 0) && !userScrolled) {
        scrollToTopWithVisualViewport()
        logScrollDebugInfo(`RAF Monitor (${elapsed}ms) - Reset triggered`)
      }
      
      rafId = requestAnimationFrame(checkAndReset)
    } else {
      // 最終確認（ユーザーがスクロールしていない場合のみ）
      if (!userScrolled) {
        const finalScrollY = window.scrollY
        const finalScrollTop = document.documentElement.scrollTop
        if (finalScrollY > 0 || finalScrollTop > 0) {
          scrollToTopWithVisualViewport()
          logScrollDebugInfo(`RAF Monitor (final) - Reset triggered`)
        }
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
// ページ遷移直後のみ動作し、ユーザーがスクロールを開始したら停止
function createDOMObserver(onContentReady: () => void) {
  let observer: MutationObserver | null = null
  let timeoutId: NodeJS.Timeout | null = null
  let userScrolled = false
  
  // ユーザーのスクロールを検知
  const checkUserScroll = () => {
    const scrollY = window.scrollY
    if (scrollY > 10) {
      userScrolled = true
    }
  }
  
  const scrollHandler = () => {
    checkUserScroll()
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })
  
  const checkContentReady = () => {
    // ユーザーがスクロールを開始していたら処理しない
    if (userScrolled) {
      return
    }
    
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
      window.removeEventListener('scroll', scrollHandler)
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
  
  // タイムアウトで強制実行（500ms後、ユーザーがスクロールしていない場合のみ）
  timeoutId = setTimeout(() => {
    if (!userScrolled) {
      onContentReady()
    }
    if (observer) {
      observer.disconnect()
      observer = null
    }
    window.removeEventListener('scroll', scrollHandler)
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
    window.removeEventListener('scroll', scrollHandler)
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
      // ただし、ユーザーがスクロールを開始したら停止
      let userScrolled = false
      const checkUserScroll = () => {
        const scrollY = window.scrollY
        if (scrollY > 10) {
          userScrolled = true
        }
      }
      
      // スクロールイベントでユーザーのスクロールを検知
      const scrollHandler = () => {
        checkUserScroll()
      }
      window.addEventListener('scroll', scrollHandler, { passive: true })
      
      const timeouts = [
        setTimeout(() => {
          if (!userScrolled) {
            scrollToTopWithVisualViewport()
            logScrollDebugInfo('Timeout 0ms')
          }
        }, 0),
        setTimeout(() => {
          if (!userScrolled) {
            scrollToTopWithVisualViewport()
            logScrollDebugInfo('Timeout 10ms')
          }
        }, 10),
        setTimeout(() => {
          if (!userScrolled) {
            scrollToTopWithVisualViewport()
            logScrollDebugInfo('Timeout 50ms')
          }
        }, 50),
        setTimeout(() => {
          if (!userScrolled) {
            scrollToTopWithVisualViewport()
            logScrollDebugInfo('Timeout 100ms')
          }
        }, 100),
        setTimeout(() => {
          if (!userScrolled) {
            scrollToTopWithVisualViewport()
            logScrollDebugInfo('Timeout 200ms')
          }
          window.removeEventListener('scroll', scrollHandler)
        }, 200)
      ]
      
      return () => {
        cleanupRAF()
        cleanupObserver()
        timeouts.forEach(clearTimeout)
        window.removeEventListener('scroll', scrollHandler)
      }
    } else {
      scrollToAbsoluteTop()
    }
  }, [pathname])

  // Visual Viewport APIのresizeイベントを監視（Safari専用、ページ遷移直後のみ）
  useEffect(() => {
    if (isSafari() && window.visualViewport) {
      let isInitialLoad = true
      let timeoutId: NodeJS.Timeout | null = null
      
      const handleResize = () => {
        // ページ遷移直後の500ms間のみ処理
        if (isInitialLoad) {
          const scrollY = window.scrollY
          const pageTop = window.visualViewport?.pageTop || 0
          
          // スクロール位置が0でない場合、リセット
          if (scrollY > 0 || pageTop > 0) {
            scrollToTopWithVisualViewport()
            logScrollDebugInfo('Visual viewport resize - Reset triggered')
          }
        }
      }
      
      // ページ遷移直後の500ms間のみイベントを監視
      window.visualViewport.addEventListener('resize', handleResize)
      
      // 500ms後に監視を停止
      timeoutId = setTimeout(() => {
        isInitialLoad = false
      }, 500)
      
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize)
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }
  }, [pathname])

  return null
}
