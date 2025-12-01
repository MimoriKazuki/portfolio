'use client'

import Link, { LinkProps } from 'next/link'
import { ReactNode } from 'react'

// Safariかどうかを判定
function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua)
}

interface SafariLinkProps extends LinkProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

/**
 * Safari用のカスタムLinkコンポーネント
 * ScrollToTopコンポーネントがリンククリックを検知して処理するため、
 * このコンポーネントは通常のLinkと同じ動作をする
 * （後方互換性のため残している）
 */
export default function SafariLink({ children, onClick, ...props }: SafariLinkProps) {
  return (
    <Link {...props} onClick={onClick}>
      {children}
    </Link>
  )
}

