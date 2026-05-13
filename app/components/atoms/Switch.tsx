'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * Switch atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § Switch
 * - docs/frontend/design-system/INDEX.md / ng-patterns.md §12 補足
 *
 * 既存 `app/components/ui/` に switch.tsx は不在のため新規作成。
 * shadcn 標準パターン（@radix-ui/react-switch）を踏襲。
 *
 * 状態：
 * - default（OFF・bg-input）
 * - checked（ON・bg-primary）
 * - disabled（opacity-50 + cursor-not-allowed）
 *
 * size: sm / md（既定）
 */

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

const switchThumbVariants = cva(
  'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
        md: 'h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type SwitchSize = NonNullable<VariantProps<typeof switchVariants>['size']>

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(switchVariants({ size }), className)}
    {...props}
  >
    <SwitchPrimitive.Thumb className={cn(switchThumbVariants({ size }))} />
  </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch, switchVariants }
