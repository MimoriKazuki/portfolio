import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * Button atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § Button
 * - docs/frontend/design-system/INDEX.md（既存 shadcn ベース継続方針）
 * - docs/frontend/design-system/tokens/colors.md（HSL マッピング経由のみ・直書き禁止）
 *
 * 既存 `app/components/ui/button.tsx`（/projects /columns 等で稼働中）は touch しない。
 * 本コンポーネントは新規画面（Phase 3 のEラーニング刷新スコープ）で使用する。
 *
 * 命名整理：
 * - 既存 shadcn の `default` → 本実装の `primary`
 * - 既存 shadcn の `destructive` → 本実装の `danger`
 * - secondary / outline / ghost は同名で踏襲
 *
 * スタイル方針：
 * - 全色は tailwind.config.ts のトークン経由（任意 px / hex 直書き禁止・ng-patterns.md 準拠）
 * - 角丸は `rounded-md`（radius.md：ボタン推奨）
 * - 既定 weight 300（app/globals.css のグローバル button ルール）に整合
 * - フォーカスリングは `focus-visible:ring-ring` で統一
 */

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        danger:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Radix Slot による wrapping（`<Link>` 等に variants を適用する用途）。
   * デフォルトは false。
   */
  asChild?: boolean
  /**
   * ローディング状態。true のとき `disabled` 相当となり、子要素は変更しない。
   * Spinner との連携は Sub 5c で別途検討。
   */
  loading?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        {...props}
      >
        {children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
