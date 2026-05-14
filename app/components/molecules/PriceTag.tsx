import * as React from 'react'
import { Price, type PriceSize } from '@/app/components/atoms/Price'
import { Tag } from '@/app/components/atoms/Tag'
import { FreeBadge } from '@/app/components/atoms/FreeBadge'
import { cn } from '@/app/lib/utils'

/**
 * PriceTag molecule（Atomic Design / molecules）
 *
 * 起点：
 * - docs/frontend/component-candidates.md molecules § PriceTag
 * - 構成：Price atom + Tag/Badge（補助情報）
 *
 * 利用例：
 * ```
 * // 通常価格
 * <PriceTag amount={3000} />
 *
 * // 割引価格
 * <PriceTag amount={2400} originalAmount={3000} label="20% OFF" labelVariant="sale" />
 *
 * // 無料
 * <PriceTag free />
 *
 * // キャンペーン中
 * <PriceTag amount={3000} label="キャンペーン中" labelVariant="campaign" />
 * ```
 *
 * - `free` true で FreeBadge atom を使用（Price free variant は併用しない・色とアイコンを統一）
 * - `originalAmount` を渡すと Price atom が「取消線旧価格＋新価格」を表示
 * - `label` を指定するとサブの Tag バッジ（"キャンペーン中" / "セール" 等）を価格に並べて表示
 * - `labelVariant`：sale（accent 色塗り）/ campaign（outlined）/ default（filled）
 * - 中央寄せ・縦横軸は呼び出し側に委ねる（inline-flex として配置）
 */

const labelVariantMap = {
  sale: { tagVariant: 'filled' as const },
  campaign: { tagVariant: 'outlined' as const },
  default: { tagVariant: 'filled' as const },
}

export type PriceTagLabelVariant = keyof typeof labelVariantMap

export interface PriceTagProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 価格（円・正値想定）。free=true の場合は無視。 */
  amount?: number
  /** 旧価格（取消線・割引時に指定）。 */
  originalAmount?: number
  /** 無料表示（FreeBadge を使用）。 */
  free?: boolean
  /** 補助バッジテキスト（"キャンペーン中" 等）。 */
  label?: string
  /** 補助バッジの種類（既定 default）。 */
  labelVariant?: PriceTagLabelVariant
  /** Price atom のサイズ（既定 md）。 */
  size?: PriceSize
}

const PriceTag = React.forwardRef<HTMLDivElement, PriceTagProps>(
  (
    {
      amount,
      originalAmount,
      free = false,
      label,
      labelVariant = 'default',
      size = 'md',
      className,
      ...props
    },
    ref,
  ) => {
    const { tagVariant } = labelVariantMap[labelVariant]

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center gap-2', className)}
        {...props}
      >
        {free ? (
          <FreeBadge />
        ) : (
          <Price amount={amount} originalAmount={originalAmount} size={size} />
        )}
        {label && (
          <Tag variant={tagVariant} size="sm">
            {label}
          </Tag>
        )}
      </div>
    )
  },
)
PriceTag.displayName = 'PriceTag'

export { PriceTag }
