import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/app/lib/utils'

/**
 * ValuePropsSection organism（Atomic Design / organisms / landing）
 *
 * 起点：
 * - docs/frontend/component-candidates.md organisms § ValuePropsSection
 * - B001 価値訴求セクション
 *
 * 構成（枠）：
 * - title（任意・h2）
 * - グリッド（sm: 1 / md: 2 / lg: cols 列・既定 3）で ValueProp カードを並べる
 * - 各カードは Icon + title（h3）+ description
 *
 * 中身は Phase 3 で具体化。
 */

export type ValuePropItem = {
  icon?: LucideIcon
  title: string
  description: string
}

export interface ValuePropsSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** セクション見出し。 */
  title?: string
  /** 補足説明。 */
  description?: string
  /** カード一覧。 */
  items: ValuePropItem[]
  /** lg 以上での列数（既定 3）。 */
  cols?: 2 | 3 | 4
}

const colsClass: Record<NonNullable<ValuePropsSectionProps['cols']>, string> = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
}

const ValuePropsSection = React.forwardRef<HTMLElement, ValuePropsSectionProps>(
  ({ title, description, items, cols = 3, className, ...props }, ref) => {
    return (
      <section
        ref={ref}
        aria-label={title ?? '価値訴求'}
        className={cn('w-full bg-background px-6 py-16 md:py-20', className)}
        {...props}
      >
        <div className="mx-auto w-full max-w-6xl">
          {(title || description) && (
            <header className="mb-10 text-center">
              {title && (
                <h2 className="text-2xl text-foreground md:text-3xl">{title}</h2>
              )}
              {description && (
                <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
                  {description}
                </p>
              )}
            </header>
          )}

          <div className={cn('grid grid-cols-1 gap-6 md:grid-cols-2', colsClass[cols])}>
            {items.map((item, idx) => {
              const Icon = item.icon
              return (
                <article
                  key={`${item.title}-${idx}`}
                  className="rounded-lg border border-border bg-card p-6 text-card-foreground"
                >
                  {Icon && (
                    <Icon aria-hidden="true" className="mb-4 h-8 w-8 text-primary" />
                  )}
                  <h3 className="text-lg text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    )
  },
)
ValuePropsSection.displayName = 'ValuePropsSection'

export { ValuePropsSection }
