import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * CourseShowcase organism（Atomic Design / organisms / landing）
 *
 * 起点：
 * - docs/frontend/component-candidates.md organisms § CourseShowcase
 * - B001 注目コースセクション
 *
 * 構成（枠・スロット式）：
 * - title / description（任意）
 * - children に CourseCard（Phase 3 実装）を並べる
 * - layout='grid'（既定）：MediaGrid と同じレスポンシブ
 * - layout='horizontal'：横スクロール（プレビュー的用途）
 *
 * 既存 LP（AITrainingLP 等）の表現とは独立。touch しない。
 */

export interface CourseShowcaseProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  description?: string
  /** 並びレイアウト。 */
  layout?: 'grid' | 'horizontal'
  /** grid layout 時の xl 列数（既定 3）。 */
  cols?: 2 | 3 | 4
  /** 末尾の "もっと見る" 等の CTA スロット。 */
  cta?: React.ReactNode
  children?: React.ReactNode
}

const gridColsClass: Record<NonNullable<CourseShowcaseProps['cols']>, string> = {
  2: 'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

const CourseShowcase = React.forwardRef<HTMLElement, CourseShowcaseProps>(
  (
    { title, description, layout = 'grid', cols = 3, cta, className, children, ...props },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        aria-label={title ?? '注目コース'}
        className={cn('w-full bg-background px-6 py-16 md:py-20', className)}
        {...props}
      >
        <div className="mx-auto w-full max-w-6xl">
          {(title || description) && (
            <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                {title && (
                  <h2 className="text-2xl text-foreground md:text-3xl">{title}</h2>
                )}
                {description && (
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                    {description}
                  </p>
                )}
              </div>
              {cta && <div className="flex items-center gap-2">{cta}</div>}
            </header>
          )}

          {layout === 'horizontal' ? (
            <div className="-mx-6 overflow-x-auto px-6">
              <div className="flex min-w-max gap-4">{children}</div>
            </div>
          ) : (
            <div className={cn('grid grid-cols-1 gap-4', gridColsClass[cols])}>
              {children}
            </div>
          )}
        </div>
      </section>
    )
  },
)
CourseShowcase.displayName = 'CourseShowcase'

export { CourseShowcase }
