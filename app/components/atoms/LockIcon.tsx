import * as React from 'react'
import { Lock } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * LockIcon atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § LockIcon
 *
 * 「視聴できないコンテンツ」を意味する semantic component。
 * lucide Lock の thin wrapper だが、意図を持たせるため atom 化（Icon と分離）。
 *
 * size: sm（h-4 w-4）/ md（h-5 w-5・既定）/ lg（h-6 w-6）
 * 色は text-muted-foreground 既定（colors.md §3「視聴ロック：グレー」）
 *
 * aria-label 既定「視聴不可」（呼び出し側で上書き可）。
 */

const lockIconVariants = cva('shrink-0 text-muted-foreground', {
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

export type LockIconSize = NonNullable<VariantProps<typeof lockIconVariants>['size']>

export interface LockIconProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, 'children'>,
    VariantProps<typeof lockIconVariants> {}

const LockIcon = React.forwardRef<SVGSVGElement, LockIconProps>(
  ({ className, size, 'aria-label': ariaLabel = '視聴不可', ...props }, ref) => {
    return (
      <Lock
        ref={ref}
        role="img"
        aria-label={ariaLabel}
        className={cn(lockIconVariants({ size }), className)}
        {...props}
      />
    )
  },
)
LockIcon.displayName = 'LockIcon'

export { LockIcon, lockIconVariants }
