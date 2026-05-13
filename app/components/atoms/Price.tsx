import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * Price atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § Price
 * - docs/frontend/design-system/tokens/typography.md §8「価格表示：font-semibold text-base（無料は text-green-700 font-medium）」
 *
 * variant：
 * - default：通常価格（¥1,000 等の表示・font-semibold）
 * - free：「無料」表示（緑系・FreeBadge と整合する色）
 * - strike：取消線（originalAmount を渡したときの旧価格表示）
 *
 * `amount` を `Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' })` で整形。
 * `originalAmount` を渡すと取消線付きの旧価格 + amount の新価格が並ぶ。
 */

const priceVariants = cva('inline-flex items-baseline gap-2', {
  variants: {
    variant: {
      default: 'text-foreground font-semibold',
      free: 'text-green-700 font-medium',
      strike: 'text-muted-foreground line-through font-normal',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

export type PriceVariant = NonNullable<VariantProps<typeof priceVariants>['variant']>
export type PriceSize = NonNullable<VariantProps<typeof priceVariants>['size']>

const formatter = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
})

export interface PriceProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof priceVariants> {
  /**
   * 価格（円・正値想定）。free variant の場合は無視される。
   * 呼び出し側の規約：
   * - 無料コンテンツには amount=0 ではなく `variant="free"` を渡す
   * - 負値は渡さない（Intl は `-￥1` 形式で整形してしまうため）
   */
  amount?: number
  /** 取消線用の旧価格。指定時は新価格 amount と並んで表示。 */
  originalAmount?: number
}

const formatPrice = (n: number): string => formatter.format(n)

const Price = React.forwardRef<HTMLSpanElement, PriceProps>(
  ({ className, variant, size, amount, originalAmount, ...props }, ref) => {
    if (variant === 'free') {
      return (
        <span
          ref={ref}
          className={cn(priceVariants({ variant: 'free', size }), className)}
          {...props}
        >
          無料
        </span>
      )
    }

    if (typeof originalAmount === 'number' && typeof amount === 'number') {
      return (
        <span ref={ref} className={cn('inline-flex items-baseline gap-2', className)} {...props}>
          <span className={priceVariants({ variant: 'strike', size })}>
            {formatPrice(originalAmount)}
          </span>
          <span className={priceVariants({ variant: 'default', size })}>
            {formatPrice(amount)}
          </span>
        </span>
      )
    }

    return (
      <span
        ref={ref}
        className={cn(priceVariants({ variant: variant ?? 'default', size }), className)}
        {...props}
      >
        {typeof amount === 'number' ? formatPrice(amount) : null}
      </span>
    )
  },
)
Price.displayName = 'Price'

export { Price, priceVariants }
