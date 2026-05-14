import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/atoms/Avatar'
import { cn } from '@/app/lib/utils'

const initialsFrom = (name: string): string => {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  return trimmed.slice(0, 1).toUpperCase()
}

/**
 * TestimonialSection organism（Atomic Design / organisms / landing）
 *
 * 起点：
 * - docs/frontend/component-candidates.md organisms § TestimonialSection
 * - B001 受講生の声セクション
 *
 * 構成（枠）：
 * - title / description（任意・h2）
 * - testimonials の各要素を blockquote として描画
 * - Avatar atom（atoms）を使用（avatar URL 省略時はイニシャルにフォールバック）
 *
 * 中身（実際の証言データ）は Phase 3 で具体化。
 */

export type TestimonialItem = {
  name: string
  role?: string
  quote: string
  avatar?: string
}

export interface TestimonialSectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  description?: string
  testimonials: TestimonialItem[]
}

const TestimonialSection = React.forwardRef<HTMLElement, TestimonialSectionProps>(
  ({ title, description, testimonials, className, ...props }, ref) => {
    return (
      <section
        ref={ref}
        aria-label={title ?? '受講生の声'}
        className={cn('w-full bg-muted/50 px-6 py-16 md:py-20', className)}
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, idx) => (
              <figure
                key={`${t.name}-${idx}`}
                className="rounded-lg border border-border bg-card p-6 text-card-foreground"
              >
                <blockquote className="text-sm leading-relaxed text-foreground">
                  「{t.quote}」
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <Avatar size="md">
                    {t.avatar && (
                      <AvatarImage src={t.avatar} alt={`${t.name} のアバター`} />
                    )}
                    <AvatarFallback>{initialsFrom(t.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{t.name}</p>
                    {t.role && (
                      <p className="truncate text-xs text-muted-foreground">{t.role}</p>
                    )}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    )
  },
)
TestimonialSection.displayName = 'TestimonialSection'

export { TestimonialSection }
