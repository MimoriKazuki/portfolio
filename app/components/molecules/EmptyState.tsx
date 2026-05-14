import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '@/app/lib/utils'

/**
 * EmptyState molecule（Atomic Design / molecules）
 *
 * 起点：
 * - docs/frontend/component-candidates.md molecules § EmptyState
 * - 構成：Icon + 見出し + 説明 + 任意 CTA
 *
 * 利用例：
 * ```
 * <EmptyState
 *   icon={Inbox}
 *   title="まだ動画がありません"
 *   description="新しいコースを追加するとここに表示されます。"
 *   action={<Button onClick={openCreate}>追加する</Button>}
 * />
 * ```
 *
 * - 中央寄せレイアウト（一覧画面の空表示）
 * - icon が省略された場合は Inbox を既定で表示
 * - title は h3 として表示（globals.css のグローバル h3 ルール weight 500 を継承）
 * - description は muted-foreground / sm サイズ
 * - action は ReactNode（Button 以外も可）
 */

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 中央上部に表示するアイコン。省略時は Inbox。 */
  icon?: LucideIcon
  /** 見出し（必須）。 */
  title: string
  /** 補足説明。 */
  description?: string
  /** CTA 領域（Button 等）。 */
  action?: React.ReactNode
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon: Icon = Inbox, title, description, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        className={cn(
          'flex w-full flex-col items-center justify-center gap-3 py-12 text-center',
          className,
        )}
        {...props}
      >
        <Icon
          aria-hidden="true"
          className="h-12 w-12 text-muted-foreground"
        />
        <h3 className="text-lg text-foreground">{title}</h3>
        {description && (
          <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
    )
  },
)
EmptyState.displayName = 'EmptyState'

export { EmptyState }
