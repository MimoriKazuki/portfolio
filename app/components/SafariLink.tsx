'use client'

import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode, useCallback, useRef } from 'react'

// Safariかどうかを判定
function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua)
}

// デバッグログ（開発環境のみ）
function debugLog(message: string, data?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SafariLink] ${message}`, data || '')
  }
}

/**
 * Safariのモメンタムスクロールを停止し、スクロール状態を「凍結」
 * body を position: fixed にすることで、スクロールを完全に無効化
 *
 * @returns 元の状態を復元する関数
 */
function freezeBodyScroll(): { unfreeze: () => void; scrollY: number } {
  const scrollY = window.scrollY
  const body = document.body
  const html = document.documentElement

  // 元のスタイルを保存
  const originalBodyStyle = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    overflow: body.style.overflow,
  }
  const originalHtmlOverflow = html.style.overflow

  // bodyをfixedにしてスクロールを凍結
  // 現在のスクロール位置を維持するためtopを設定
  body.style.position = 'fixed'
  body.style.top = `-${scrollY}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.overflow = 'hidden'
  html.style.overflow = 'hidden'

  debugLog('Body frozen', { scrollY })

  return {
    scrollY,
    unfreeze: () => {
      // 元のスタイルを復元
      body.style.position = originalBodyStyle.position
      body.style.top = originalBodyStyle.top
      body.style.left = originalBodyStyle.left
      body.style.right = originalBodyStyle.right
      body.style.overflow = originalBodyStyle.overflow
      html.style.overflow = originalHtmlOverflow
      debugLog('Body unfrozen')
    }
  }
}

/**
 * 複数の方法でスクロール位置を0にリセット
 * Safari固有の問題に対応するため、複数のAPIを使用
 */
function forceScrollToTopAllMethods(): void {
  // Method 1: window.scrollTo
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

interface SafariLinkProps extends LinkProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

/**
 * Safari用のカスタムLinkコンポーネント
 *
 * iOS Safariのスクロール位置問題を解決するため、以下の処理を行う：
 * 1. リンククリック時にe.preventDefault()でナビゲーションを停止
 * 2. body を position: fixed にしてモメンタムスクロールを完全停止
 * 3. router.push()で遷移（scroll: false オプション付き）
 * 4. 遷移後にbodyを復元し、スクロール位置を0にリセット
 *
 * Safari以外のブラウザでは通常のLinkと同じ動作をする
 */
export default function SafariLink({ children, onClick, href, ...props }: SafariLinkProps) {
  const router = useRouter()
  const isNavigatingRef = useRef(false)

  const handleClick = useCallback(async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 既にナビゲーション中の場合は無視
    if (isNavigatingRef.current) {
      e.preventDefault()
      return
    }

    // Safari以外は通常のLinkの動作
    if (!isSafari()) {
      onClick?.()
      return
    }

    // Safari: ナビゲーションを制御
    e.preventDefault()
    isNavigatingRef.current = true

    const startTime = performance.now()
    const targetHref = typeof href === 'string' ? href : href.pathname || '/'

    debugLog('Navigation intercepted', {
      href: targetHref,
      scrollY: window.scrollY,
      startTime
    })

    try {
      // Step 1: bodyを凍結してモメンタムスクロールを停止
      const { unfreeze, scrollY } = freezeBodyScroll()
      debugLog('Step 1: Body frozen', { originalScrollY: scrollY })

      // Step 2: 少し待ってからナビゲーション実行
      // これにより、Safariのスクロール状態が確実にリセットされる
      await new Promise(resolve => setTimeout(resolve, 50))

      // Step 3: スクロール位置を0にセット（凍結状態で）
      forceScrollToTopAllMethods()
      debugLog('Step 2: Scroll reset while frozen', { scrollY: window.scrollY })

      // Step 4: ナビゲーション実行（scroll: false）
      onClick?.()

      // ============================================
      // 検証: ハードナビゲーション（完全なページリロード）
      // SPAナビゲーションの問題かどうかを切り分けるため
      // ============================================
      unfreeze()

      const duration = performance.now() - startTime
      debugLog('Step 3: Using HARD navigation (full page reload)', {
        href: targetHref,
        duration: `${duration.toFixed(2)}ms`
      })

      // ハードナビゲーション: 完全なページリロードを行う
      // これでSafariの全ての内部状態（アドレスバー、スクロール方向等）がリセットされる
      window.location.href = targetHref

    } catch (error) {
      debugLog('Error during navigation', { error })
      // エラーが発生した場合もナビゲーションは実行
      router.push(typeof href === 'string' ? href : href.pathname || '/')
    } finally {
      // 遅延してからフラグをリセット（連続クリック防止）
      setTimeout(() => {
        isNavigatingRef.current = false
      }, 500)
    }
  }, [href, onClick, router])

  return (
    <Link {...props} href={href} onClick={handleClick}>
      {children}
    </Link>
  )
}

