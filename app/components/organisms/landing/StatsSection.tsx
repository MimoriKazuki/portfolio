import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * StatsSection organism（Atomic Design / organisms / landing）
 *
 * 起点：
 * - docs/frontend/component-candidates.md organisms § StatsSection
 * - B001 実績数値セクション
 *
 * 構成（枠）：
 * - title / description（任意）
 * - 数値カード × N（grid）：value（大型タイポ） + label（小）+ prefix/suffix（任意）
 * - 数値の整形は呼び出し側（props.value は string）
 *
 * 中身は Phase 3 で具体化。
 */

export type StatItem = {
  label: string
  /** 数値文字列（"3,500" など整形済を渡す）。 */
  value: string
  prefix?: string
  suffix?: string
}

export interface StatsSectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  description?: string
  stats: StatItem[]
  /** lg 以上での列数（既定：stats 件数に合わせ最大 4）。 */
  cols?: 2 | 3 | 4
}

const colsClass: Record<NonNullable<StatsSectionProps['cols']>, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
}

const StatsSection = React.forwardRef<HTMLElement, StatsSectionProps>(
  ({ title, description, stats, cols, className, ...props }, ref) => {
    const resolvedCols = cols ?? (Math.min(stats.length, 4) as NonNullable<StatsSectionProps['cols']>)
    return (
      <section
        ref={ref}
        aria-label={title ?? '実績数値'}
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

          <dl className={cn('grid grid-cols-1 gap-6', colsClass[resolvedCols])}>
            {stats.map((s, idx) => (
              <div
                key={`${s.label}-${idx}`}
                className="rounded-lg border border-border bg-card p-6 text-center text-card-foreground"
              >
                <dt className="text-sm text-muted-foreground">{s.label}</dt>
                <dd className="mt-2 text-3xl text-foreground md:text-4xl">
                  {s.prefix && (
                    <span className="mr-1 text-base text-muted-foreground">{s.prefix}</span>
                  )}
                  {s.value}
                  {s.suffix && (
                    <span className="ml-1 text-base text-muted-foreground">{s.suffix}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    )
  },
)
StatsSection.displayName = 'StatsSection'

export { StatsSection }
