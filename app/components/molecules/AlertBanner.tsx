'use client'

import * as React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * AlertBanner molecule（Atomic Design / molecules）
 *
 * 起点：
 * - docs/frontend/component-candidates.md molecules § AlertBanner
 * - 構成：Icon + テキスト + Close（dismissible 時）
 *
 * 利用例：
 * ```
 * <AlertBanner variant="warning" title="視聴期限が近づいています" description="3 日後に終了します。" />
 * <AlertBanner variant="info" description="メンテナンス予定があります。" dismissible onDismiss={() => {}} />
 * ```
 *
 * variant: success / warning / danger / info
 * dismissible: 右端に X ボタンを表示し、クリックで内部 state により非表示にする
 *   - controlled する場合は onDismiss を渡し、表示制御は親に委譲
 */

const alertBannerVariants = cva(
  'relative flex w-full items-start gap-3 rounded-md border p-4 text-sm',
  {
    variants: {
      variant: {
        success:
          'border-primary/30 bg-primary/10 text-foreground [&_[data-alert-icon]]:text-primary',
        warning:
          'border-border bg-accent text-foreground [&_[data-alert-icon]]:text-foreground',
        danger:
          'border-destructive/30 bg-destructive/10 text-foreground [&_[data-alert-icon]]:text-destructive',
        info:
          'border-border bg-muted text-foreground [&_[data-alert-icon]]:text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
)

const iconByVariant = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
} as const

export type AlertBannerVariant = NonNullable<
  VariantProps<typeof alertBannerVariants>['variant']
>

export interface AlertBannerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof alertBannerVariants> {
  /** 見出し（任意）。 */
  title?: string
  /** 説明（必須）。 */
  description: React.ReactNode
  /** 右端の閉じるボタン表示。 */
  dismissible?: boolean
  /** 閉じるクリック時のコールバック（controlled 用）。 */
  onDismiss?: () => void
}

const AlertBanner = React.forwardRef<HTMLDivElement, AlertBannerProps>(
  (
    {
      className,
      variant = 'info',
      title,
      description,
      dismissible = false,
      onDismiss,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(true)
    const Icon = iconByVariant[variant ?? 'info']

    const handleDismiss = () => {
      if (onDismiss) {
        onDismiss()
      } else {
        setOpen(false)
      }
    }

    if (!open && !onDismiss) return null

    const isDanger = variant === 'danger'

    return (
      <div
        ref={ref}
        role={isDanger ? 'alert' : 'status'}
        className={cn(alertBannerVariants({ variant }), className)}
        {...props}
      >
        <Icon
          aria-hidden="true"
          data-alert-icon
          className="mt-0.5 h-5 w-5 shrink-0"
        />
        <div className="flex-1 space-y-1">
          {title && <p className="text-sm text-foreground">{title}</p>}
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="閉じる"
            className="ml-auto -mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  },
)
AlertBanner.displayName = 'AlertBanner'

export { AlertBanner, alertBannerVariants }
