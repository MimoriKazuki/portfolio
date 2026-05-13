import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * Spinner atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § Spinner
 * - lucide-react の Loader2 を animate-spin で回転
 *
 * size: sm（h-4 w-4=16px）/ md（h-5 w-5=20px・既定）/ lg（h-6 w-6=24px）
 * 色は `text-current` で親要素から継承（呼び出し側で `text-primary` 等を付ける）。
 *
 * アクセシビリティ：
 * - 既定 role="status" + aria-label="loading"
 * - 上書きしたい場合は呼び出し側で props を渡す（label 多言語化等）
 */

const spinnerVariants = cva('animate-spin text-current', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type SpinnerSize = NonNullable<VariantProps<typeof spinnerVariants>['size']>

export interface SpinnerProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, 'children'>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, role = 'status', 'aria-label': ariaLabel = 'loading', ...props }, ref) => {
    return (
      <Loader2
        ref={ref}
        role={role}
        aria-label={ariaLabel}
        className={cn(spinnerVariants({ size }), className)}
        {...props}
      />
    )
  },
)
Spinner.displayName = 'Spinner'

export { Spinner, spinnerVariants }
