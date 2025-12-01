'use client'

import Link, { LinkProps } from 'next/link'
import { ReactNode } from 'react'

// Safariかどうかを判定
function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua)
}

// スクロール方向をリセットする関数
function resetScrollDirection() {
  if (!isSafari()) return
  
  // スクロール方向をリセットするため、1px上にスクロールしてから0に戻す
  const currentScroll = window.scrollY
  if (currentScroll > 0) {
    // 1px上にスクロール（スクロール方向をリセット）
    window.scrollTo(0, currentScroll - 1)
    // 即座に0に戻す
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    })
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
 * リンククリック時にスクロール方向をリセットしてから遷移する
 */
export default function SafariLink({ children, onClick, ...props }: SafariLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Safariの場合のみスクロール方向をリセット
    if (isSafari()) {
      const href = props.href?.toString()
      // 内部リンクでアンカーリンクでない場合のみ処理
      if (href && href.startsWith('/') && !href.includes('#')) {
        resetScrollDirection()
      }
    }
    
    // 元のonClickハンドラーを実行
    if (onClick) {
      onClick()
    }
  }

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  )
}

