import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * Badge atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § Badge
 * - docs/frontend/design-system/tokens/colors.md §3 セマンティックカラーの運用
 * - shadcn badge ベース・cva 構造
 *
 * variant：
 * - success：緑系（無料・視聴完了 等）
 * - warning：黄/琥珀系（非公開・下書き 等）
 * - danger：赤系（削除・refunded 等。`--destructive` トークン使用）
 * - info：青系（カテゴリ・情報通知 等。`--primary` トークン使用）
 * - neutral：グレー系（既定の汎用バッジ）
 *
 * 設計判断：
 * - --success / --warning / --info の CSS 変数は globals.css に未定義のため、
 *   colors.md §3 に従い Tailwind 標準パレット（green / yellow / amber 等）を本 atom 内で
 *   セマンティック集約する。これは ng-patterns §1 が禁ずる「散発的な直接色名使用」とは
 *   別物で、atom 内で集約することで呼び出し側にはセマンティックな名前のみが露出する。
 * - danger / info は既存トークン（--destructive / --primary）を経由。
 */

const badgeVariants = cva(
  'inline-flex items-center rounded-sm font-medium ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        success: 'bg-green-100 text-green-700 border border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        danger: 'bg-destructive/10 text-destructive border border-destructive/20',
        info: 'bg-primary/10 text-primary border border-primary/20',
        neutral: 'bg-muted text-muted-foreground border border-border',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-xs',
        md: 'px-2 py-0.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  },
)

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>
export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>['size']>

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
