'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * Label atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § Label
 * - docs/frontend/design-system/INDEX.md / ng-patterns.md §12 補足
 *
 * 既存 `app/components/ui/` に label.tsx は不在のため新規作成。
 *
 * required 表示：
 * - required=true で末尾に赤いアスタリスク `*` を付与
 * - aria-required を子の input 側で設定するため、視覚補助のみここに記述
 *
 * @radix-ui/react-label を使うことで peer-disabled の追従が容易（既存 shadcn 標準パターン）。
 */

const labelVariants = cva(
  'font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type LabelSize = NonNullable<VariantProps<typeof labelVariants>['size']>

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  /**
   * 必須項目を示すアスタリスクを表示する。
   * 実際の aria-required は対応する input 側に付与すること。
   */
  required?: boolean
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, size, required = false, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ size }), className)}
    {...props}
  >
    {children}
    {required && (
      <span aria-hidden="true" className="ml-0.5 text-destructive">
        *
      </span>
    )}
  </LabelPrimitive.Root>
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label, labelVariants }
