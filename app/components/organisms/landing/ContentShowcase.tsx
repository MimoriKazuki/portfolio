import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * ContentShowcase organism（Atomic Design / organisms / landing）
 *
 * 起点：
 * - docs/frontend/component-candidates.md organisms § ContentShowcase
 * - B001 注目単体動画セクション
 *
 * 構成は CourseShowcase と同様（スロット式）。
 * 区別のため別 organism として分離（A/B 配置や見出し文言が異なるため）。
 *
 * 中身（ContentCard 等）は Phase 3 で実装。
 */

export interface ContentShowcaseProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  description?: string
  layout?: 'grid' | 'horizontal'
  cols?: 2 | 3 | 4
  cta?: React.ReactNode
  children?: React.ReactNode
}

const gridColsClass: Record<NonNullable<ContentShowcaseProps['cols']>, string> = {
  2: 'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

const ContentShowcase = React.forwardRef<HTMLElement, ContentShowcaseProps>(
  (
    { title, description, layout = 'grid', cols = 4, cta, className, children, ...props },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        aria-label={title ?? '注目動画'}
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
ContentShowcase.displayName = 'ContentShowcase'

export { ContentShowcase }
