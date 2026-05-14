import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/app/components/atoms/Button'
import { cn } from '@/app/lib/utils'

/**
 * ContactSection organism（Atomic Design / organisms / landing）
 *
 * 起点：
 * - docs/frontend/component-candidates.md organisms § ContactSection
 * - B001 お問い合わせ導線
 *
 * 構成（枠）：
 * - title / description（任意）
 * - CTA ボタン（既存 atoms/Button・asChild で Link ラップ）
 *
 * 既存 ContactButton（app/components/ContactButton.tsx）は touch しない。
 * 本 organism は LP 内専用の CTA セクションとして独立した枠を提供する。
 *
 * 中身（実 URL や文言）は Phase 3 で具体化。
 */

export interface ContactSectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  description?: string
  /** CTA ボタンのラベル。 */
  ctaLabel?: string
  /** CTA ボタンのリンク先。 */
  ctaHref?: string
  /** 補助 CTA（電話番号や別経路リンク等を任意で）。 */
  secondaryCta?: React.ReactNode
}

const ContactSection = React.forwardRef<HTMLElement, ContactSectionProps>(
  (
    {
      title = 'お気軽にお問い合わせください',
      description,
      ctaLabel = 'お問い合わせ',
      ctaHref = '/contact',
      secondaryCta,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        aria-label="お問い合わせ"
        className={cn('w-full bg-primary/5 px-6 py-16 md:py-20', className)}
        {...props}
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
          <h2 className="text-2xl text-foreground md:text-3xl">{title}</h2>
          {description && (
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              {description}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
            {secondaryCta}
          </div>
        </div>
      </section>
    )
  },
)
ContactSection.displayName = 'ContactSection'

export { ContactSection }
