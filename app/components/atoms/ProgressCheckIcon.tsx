import * as React from 'react'
import { CheckCircle, Circle } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * ProgressCheckIcon atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § ProgressCheckIcon
 *
 * 視聴完了マーク。
 * variant：
 * - completed：lucide CheckCircle・primary 色
 * - pending：lucide Circle・muted 色
 *
 * size: sm（h-4 w-4）/ md（h-5 w-5・既定）/ lg（h-6 w-6）
 *
 * aria-label は既定で「視聴完了」「未視聴」を付与（呼び出し側で上書き可）。
 */

const progressCheckIconVariants = cva('shrink-0', {
  variants: {
    variant: {
      completed: 'text-primary',
      pending: 'text-muted-foreground',
    },
    size: {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    },
  },
  defaultVariants: {
    variant: 'pending',
    size: 'md',
  },
})

export type ProgressCheckIconVariant = NonNullable<
  VariantProps<typeof progressCheckIconVariants>['variant']
>
export type ProgressCheckIconSize = NonNullable<
  VariantProps<typeof progressCheckIconVariants>['size']
>

export interface ProgressCheckIconProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, 'children'>,
    VariantProps<typeof progressCheckIconVariants> {}

const ProgressCheckIcon = React.forwardRef<SVGSVGElement, ProgressCheckIconProps>(
  ({ className, variant = 'pending', size, 'aria-label': ariaLabel, ...props }, ref) => {
    const Component = variant === 'completed' ? CheckCircle : Circle
    const defaultLabel = variant === 'completed' ? '視聴完了' : '未視聴'
    return (
      <Component
        ref={ref}
        role="img"
        aria-label={ariaLabel ?? defaultLabel}
        className={cn(progressCheckIconVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)
ProgressCheckIcon.displayName = 'ProgressCheckIcon'

export { ProgressCheckIcon, progressCheckIconVariants }
