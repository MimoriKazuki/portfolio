import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * ProgressBar atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § ProgressBar
 * - docs/frontend/design-system/tokens/radius.md「進捗バー：トラックとフィル両方 rounded-full（細長いピル形）」
 *
 * 構造：
 * - 外側 div：トラック（bg-muted）・rounded-full
 * - 内側 div：フィル（bg-primary）・rounded-full + width %
 * - role="progressbar" + aria-valuenow/min/max を付与
 *
 * size: sm（h-1.5）/ md（h-2・既定）/ lg（h-3）
 * showPercent: true で右側に "%" 表示
 */

const progressTrackVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-muted',
  {
    variants: {
      size: {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

const progressFillClass = 'h-full rounded-full bg-primary transition-all'

export type ProgressBarSize = NonNullable<
  VariantProps<typeof progressTrackVariants>['size']
>

export interface ProgressBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof progressTrackVariants> {
  /** 現在値（0 〜 max）。 */
  value: number
  /** 最大値。既定 100。 */
  max?: number
  /** 右側にパーセンテージを表示するか。既定 false。 */
  showPercent?: boolean
}

const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n))

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, size, value, max = 100, showPercent = false, ...props }, ref) => {
    const safeMax = max > 0 ? max : 100
    const safeValue = clamp(value, 0, safeMax)
    const percent = Math.round((safeValue / safeMax) * 100)

    return (
      <div
        ref={ref}
        className={cn('flex w-full items-center gap-3', className)}
        {...props}
      >
        <div
          role="progressbar"
          aria-valuenow={safeValue}
          aria-valuemin={0}
          aria-valuemax={safeMax}
          className={progressTrackVariants({ size })}
        >
          <div
            className={progressFillClass}
            style={{ width: `${percent}%` }}
          />
        </div>
        {showPercent && (
          <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
            {percent}%
          </span>
        )}
      </div>
    )
  },
)
ProgressBar.displayName = 'ProgressBar'

export { ProgressBar, progressTrackVariants }
