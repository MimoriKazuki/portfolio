import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * Icon atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § Icon
 * - 既存採用継続：lucide-react を全プロジェクトで利用
 *
 * lucide-react の LucideIcon を `as` prop で受け取り、size と className を統一管理する thin wrapper。
 * 既存 ui/ に該当 wrapper は無いため新規作成。
 *
 * 用途：
 * - サイズ統一（sm 16px / md 20px / lg 24px）
 * - aria-label / aria-hidden は呼び出し側で適切に指定（装飾なら aria-hidden、情報伝達なら aria-label）
 */

const iconVariants = cva('shrink-0', {
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

export type IconSize = NonNullable<VariantProps<typeof iconVariants>['size']>

export interface IconProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, 'children'>,
    VariantProps<typeof iconVariants> {
  /**
   * lucide-react などからインポートした LucideIcon コンポーネント。
   */
  as: LucideIcon
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ as: Component, size, className, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(iconVariants({ size }), className)}
        {...props}
      />
    )
  },
)
Icon.displayName = 'Icon'

export { Icon, iconVariants }
