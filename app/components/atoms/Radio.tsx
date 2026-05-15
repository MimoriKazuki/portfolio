'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * Radio atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § Radio
 * - docs/frontend/design-system/INDEX.md / ng-patterns.md §12 補足
 *
 * 既存 `app/components/ui/` に radio-group.tsx は不在のため新規作成。
 * shadcn 標準パターン（@radix-ui/react-radio-group）を踏襲。
 *
 * 構造：
 * - <RadioGroup> ：複数 RadioGroupItem を束ねるコンテナ
 * - <RadioGroupItem value="..." /> ：個別のラジオボタン
 *
 * size は RadioGroup から RadioGroupItem に props で連動する想定だが、
 * 利用側で都度指定する方が柔軟なため、RadioGroupItem 側に size prop を持たせる。
 */

const radioGroupItemVariants = cva(
  // bg-white：未選択時の背景を白明示（ページ背景との同化を回避・Kosuke FB 2026-05-15）。
  // 選択時の Indicator（Circle）は別 div で描画されるため背景には影響しない。
  'aspect-square rounded-full border border-primary bg-white text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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

export type RadioSize = NonNullable<VariantProps<typeof radioGroupItemVariants>['size']>

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn('grid gap-2', className)}
    {...props}
  />
))
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioGroupItemVariants> {}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, size, ...props }, ref) => {
  const dotSize = size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5'
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(radioGroupItemVariants({ size }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className={cn(dotSize, 'fill-current text-current')} aria-hidden="true" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem, radioGroupItemVariants }
