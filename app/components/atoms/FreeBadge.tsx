import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * FreeBadge atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § FreeBadge
 * - docs/frontend/design-system/tokens/colors.md §3「成功・無料：緑系（text-green-700 / border-green-200 等）」
 *
 * 「無料」表示を統一する atom。新規 Eラーニング画面で使用する想定。
 * 既存 LP（AITrainingLP / ServiceTrainingLP / Footer 等）の「無料」表示は **触らない**
 * （既存ページ非破壊・後続で段階的に置換可能）。
 *
 * size: sm（px-1.5 py-0.5 text-xs）/ md（px-2 py-0.5 text-xs・既定）
 *
 * 色は Badge.tsx の success variant と同じく atom 内集約（globals.css の --success 未定義のため）。
 */

const freeBadgeVariants = cva(
  'inline-flex items-center rounded-sm font-medium bg-green-100 text-green-700 border border-green-200',
  {
    variants: {
      size: {
        sm: 'px-1.5 py-0.5 text-xs',
        md: 'px-2 py-0.5 text-xs',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type FreeBadgeSize = NonNullable<VariantProps<typeof freeBadgeVariants>['size']>

export interface FreeBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof freeBadgeVariants> {
  /** 表示テキスト。既定「無料」。 */
  label?: string
}

const FreeBadge = React.forwardRef<HTMLSpanElement, FreeBadgeProps>(
  ({ className, size, label = '無料', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(freeBadgeVariants({ size }), className)}
        {...props}
      >
        {label}
      </span>
    )
  },
)
FreeBadge.displayName = 'FreeBadge'

export { FreeBadge, freeBadgeVariants }
