import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * Input atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § Input
 * - docs/frontend/design-system/INDEX.md / ng-patterns.md §12 補足
 * - docs/frontend/design-system/tokens/colors.md（フォーカスリング・エラー色）
 *
 * 既存 `app/components/ui/` に input.tsx は不在のため新規作成。
 *
 * スタイル方針：
 * - 全色は tailwind.config.ts のトークン経由（直書き禁止）
 * - 角丸は `rounded-md`（radius.md：Input 推奨）
 * - フォーカスリング `focus-visible:ring-ring`
 * - aria-invalid="true" のときエラースタイル（destructive 系）
 * - iOS Safari の input zoom 抑制（base 16px / globals.css ルール）
 */

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive file:border-0 file:bg-transparent file:text-sm file:font-medium',
  {
    variants: {
      size: {
        sm: 'h-9 px-3 py-1',
        md: 'h-10 px-3 py-2',
        lg: 'h-11 px-4 py-2',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type InputSize = NonNullable<VariantProps<typeof inputVariants>['size']>

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(inputVariants({ size }), className)}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input, inputVariants }
