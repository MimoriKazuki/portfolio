import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * AdminPageHeader organism（Atomic Design / organisms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md organisms § AdminPageHeader
 * - 管理画面（C*）共通のページヘッダー
 *
 * 利用例：
 * ```
 * <AdminPageHeader
 *   title="コース管理"
 *   description="公開中のコースとその状態を管理します。"
 *   actions={
 *     <>
 *       <Button variant="outline">CSV エクスポート</Button>
 *       <Button>新規作成</Button>
 *     </>
 *   }
 * />
 * ```
 *
 * 構成：
 * - 左：title（h1）+ description
 * - 右：actions スロット（Button 群を想定）
 * - スモール時は縦並び、md 以上で横並び
 */

export interface AdminPageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** ページタイトル（h1）。 */
  title: string
  /** 補足説明。 */
  description?: string
  /** 右端のアクションスロット（Button 等）。 */
  actions?: React.ReactNode
}

const AdminPageHeader = React.forwardRef<HTMLElement, AdminPageHeaderProps>(
  ({ title, description, actions, className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between',
          className,
        )}
        {...props}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="truncate text-2xl text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </header>
    )
  },
)
AdminPageHeader.displayName = 'AdminPageHeader'

export { AdminPageHeader }
