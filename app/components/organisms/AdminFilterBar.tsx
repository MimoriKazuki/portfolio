'use client'

import * as React from 'react'
import { SearchField } from '@/app/components/molecules/SearchField'
import { cn } from '@/app/lib/utils'

/**
 * AdminFilterBar organism（Atomic Design / organisms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md organisms § AdminFilterBar
 * - 管理一覧画面（C*）の汎用フィルタバー
 *
 * 構成：
 * - 左端：SearchField molecule（searchValue / onSearchChange）
 * - 中央：filters スロット（呼び出し側で Select / DatePicker / Tag selectable 等を自由配置）
 * - 右端：actions スロット（リセット / 適用 ボタン等）
 *
 * 利用例：
 * ```
 * <AdminFilterBar
 *   searchValue={q}
 *   onSearchChange={setQ}
 *   filters={[
 *     <Select key="status" value={status} onValueChange={setStatus} options={...} />,
 *     <DatePicker key="from" value={from} onChange={setFrom} />,
 *   ]}
 *   actions={<Button variant="outline" onClick={reset}>リセット</Button>}
 * />
 * ```
 *
 * - md 以上で横並び / sm 以下で縦並び
 * - SearchField は flex-1 で残幅を取る
 */

export interface AdminFilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  searchValue: string
  onSearchChange: (value: string) => void
  /** 検索プレースホルダ。 */
  searchPlaceholder?: string
  /** 中央スロット（複数フィルタ要素）。 */
  filters?: React.ReactNode[]
  /** 右端アクションスロット。 */
  actions?: React.ReactNode
}

const AdminFilterBar = React.forwardRef<HTMLDivElement, AdminFilterBarProps>(
  (
    {
      searchValue,
      onSearchChange,
      searchPlaceholder = '検索',
      filters,
      actions,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role="search"
        className={cn(
          'flex flex-col gap-3 md:flex-row md:items-center md:gap-2',
          className,
        )}
        {...props}
      >
        <div className="md:flex-1">
          <SearchField
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </div>
        {filters && filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">{filters}</div>
        )}
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    )
  },
)
AdminFilterBar.displayName = 'AdminFilterBar'

export { AdminFilterBar }
