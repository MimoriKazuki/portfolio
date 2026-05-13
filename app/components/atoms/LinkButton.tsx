import * as React from 'react'
import Link from 'next/link'
import { Button, type ButtonProps } from './Button'
import { cn } from '@/app/lib/utils'

/**
 * LinkButton atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § LinkButton
 * - 既存 atoms/Button の `asChild` prop（Radix Slot）を活用
 *
 * リンク兼ボタン：見た目は Button atom、振る舞いは next/link or `<a>`（外部）。
 *
 * - 内部リンク（href が `/` 始まり）→ next/link を子要素に Button のスタイルを纏わせる（asChild）
 * - 外部リンク（http/https 始まり）→ `<a target="_blank" rel="noopener noreferrer">`
 *
 * variant / size は Button atom と同じ ButtonProps を継承（primary/outline 主用途）。
 */

type ButtonStyleProps = Pick<ButtonProps, 'variant' | 'size' | 'className'>

export interface LinkButtonProps extends ButtonStyleProps {
  href: string
  /** 強制的に外部リンク扱いにする。既定は href の形式から自動判定。 */
  external?: boolean
  children: React.ReactNode
  /**
   * 任意で aria 属性等を付与（next/link は <a> を内部レンダリングするため anchor 属性が透過）。
   */
  'aria-label'?: string
}

const isExternalHref = (href: string): boolean =>
  /^(https?:)?\/\//.test(href) || /^mailto:/.test(href) || /^tel:/.test(href)

const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ href, variant, size, className, external, children, ...rest }, ref) => {
    const isExternal = external ?? isExternalHref(href)

    if (isExternal) {
      return (
        <Button asChild variant={variant} size={size} className={cn(className)}>
          <a
            ref={ref}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            {...rest}
          >
            {children}
          </a>
        </Button>
      )
    }

    return (
      <Button asChild variant={variant} size={size} className={cn(className)}>
        <Link ref={ref} href={href} {...rest}>
          {children}
        </Link>
      </Button>
    )
  },
)
LinkButton.displayName = 'LinkButton'

export { LinkButton }
