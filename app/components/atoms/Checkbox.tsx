'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * Checkbox atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § Checkbox
 * - docs/frontend/design-system/INDEX.md / ng-patterns.md §12 補足
 *
 * 既存 `app/components/ui/` に checkbox.tsx は不在のため新規作成。
 * shadcn の標準パターン（@radix-ui/react-checkbox）を踏襲。
 *
 * 状態：
 * - default（未チェック）
 * - checked（チェック済）
 * - indeterminate（中間状態・Radix の "indeterminate" 値で表現）
 * - disabled
 *
 * アイコン併用（ng-patterns §7：色のみで状態を伝えない）：
 * - checked → Check アイコン / indeterminate → Minus アイコン
 */

const checkboxVariants = cva(
  // 子要素から data-state を参照できるよう `group` を付与（forceMount したインジケータの中で CSS 制御）
  // rounded-none：チェックボックス（直角）vs ラジオ（円）の視覚区別を最大化（Kosuke FB 2026-05-15）
  'group peer shrink-0 rounded-none border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type CheckboxSize = NonNullable<VariantProps<typeof checkboxVariants>['size']>

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size, ...props }, ref) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(checkboxVariants({ size }), className)}
      {...props}
    >
      {/*
       * 非コントロールド（defaultChecked）でも indeterminate 状態を正しく表示するため、
       * Indicator を forceMount して両アイコンを常時 DOM に置き、Root の data-state を
       * group 参照で CSS 制御する（review-mate 注意指摘対応）。
       */}
      <CheckboxPrimitive.Indicator
        forceMount
        className="flex items-center justify-center text-current"
      >
        <Check
          className={cn(iconSize, 'hidden group-data-[state=checked]:block')}
          aria-hidden="true"
        />
        <Minus
          className={cn(iconSize, 'hidden group-data-[state=indeterminate]:block')}
          aria-hidden="true"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox, checkboxVariants }
