import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, Slash } from 'lucide-react'
import { cn } from '@/app/lib/utils'

/**
 * Breadcrumb molecule（Atomic Design / molecules）
 *
 * 起点：
 * - docs/frontend/component-candidates.md molecules § Breadcrumb
 * - 構成：Link × N + Separator
 *
 * 利用例：
 * ```
 * <Breadcrumb items={[
 *   { label: 'ホーム', href: '/' },
 *   { label: 'Eラーニング', href: '/e-learning' },
 *   { label: 'AI開発入門' },              // href なし＝current
 * ]} />
 * ```
 *
 * - aria-label="パンくず"（nav）
 * - 末尾アイテム（href なし）に aria-current="page"
 * - separator: 'chevron'（既定・ChevronRight）/ 'slash'（Slash）
 */

export type BreadcrumbItem = {
  label: string
  /** 省略時は current（最後のアイテム） */
  href?: string
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  separator?: 'chevron' | 'slash'
}

const SeparatorIcon: React.FC<{ kind: 'chevron' | 'slash' }> = ({ kind }) => {
  const Icon = kind === 'slash' ? Slash : ChevronRight
  return (
    <Icon
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
    />
  )
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator = 'chevron', className, ...props }, ref) => {
    if (items.length === 0) return null

    return (
      <nav
        ref={ref}
        aria-label="パンくず"
        className={cn('w-full', className)}
        {...props}
      >
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1
            const isCurrent = !item.href || isLast
            return (
              <li key={`${item.label}-${idx}`} className="flex items-center gap-1.5">
                {isCurrent ? (
                  <span
                    aria-current="page"
                    className="text-foreground"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href!}
                    className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline"
                  >
                    {item.label}
                  </Link>
                )}
                {!isLast && <SeparatorIcon kind={separator} />}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  },
)
Breadcrumb.displayName = 'Breadcrumb'

export { Breadcrumb }
