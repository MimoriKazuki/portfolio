'use client'

import * as React from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { Checkbox } from '@/app/components/atoms/Checkbox'
import { Spinner } from '@/app/components/atoms/Spinner'
import { Pagination } from '@/app/components/molecules/Pagination'
import { EmptyState } from '@/app/components/molecules/EmptyState'
import { cn } from '@/app/lib/utils'

/**
 * AdminDataTable organism（Atomic Design / organisms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md organisms § AdminDataTable
 * - 管理画面（C*）の汎用一覧テーブル
 *
 * 構成：
 * - columns + data ドリブン（render 関数で柔軟にセル表現）
 * - sortable 列ヘッダクリックで onSort 発火（並び替え状態は親で保持）
 * - selectable=true で先頭に Checkbox 列を表示・onSelect で選択 ID 配列を通知
 * - pagination prop で Pagination molecule を下部に表示
 * - loading=true で Spinner オーバーレイ・isEmpty=true で EmptyState を表示
 *
 * 行 ID は `getRowId?: (row) => string` で取得。省略時は `String(row.id ?? index)`。
 */

export type SortDirection = 'asc' | 'desc'

export type AdminDataTableColumn<T> = {
  key: string
  label: string
  sortable?: boolean
  /** 数値・金額等は right、ラベルは center 推奨。 */
  align?: 'left' | 'center' | 'right'
  render?: (row: T, rowIndex: number) => React.ReactNode
  /** th / td 共通の className。 */
  className?: string
}

export interface AdminDataTablePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export interface AdminDataTableProps<T>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  columns: AdminDataTableColumn<T>[]
  data: T[]
  /** 並び替え変更時のコールバック。 */
  onSort?: (key: string, direction: SortDirection) => void
  /** 現在の並び替え（親が保持）。 */
  sortKey?: string
  sortDirection?: SortDirection
  /** 行選択（一括操作）を有効化。 */
  selectable?: boolean
  /** 選択中の行 ID 配列（controlled）。 */
  selectedIds?: string[]
  onSelect?: (ids: string[]) => void
  /** 行 ID 取得関数（既定 String(row.id ?? index)）。 */
  getRowId?: (row: T, rowIndex: number) => string
  /** ページング情報。 */
  pagination?: AdminDataTablePaginationProps
  /** ローディングオーバーレイ表示。 */
  loading?: boolean
  /** 空状態を強制表示（data.length===0 と同等）。 */
  isEmpty?: boolean
  /** 空状態の slot（既定の EmptyState を上書き）。 */
  emptyState?: React.ReactNode
}

const alignClass: Record<NonNullable<AdminDataTableColumn<unknown>['align']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

function AdminDataTableInner<T>(
  {
    columns,
    data,
    onSort,
    sortKey,
    sortDirection,
    selectable = false,
    selectedIds,
    onSelect,
    getRowId,
    pagination,
    loading = false,
    isEmpty,
    emptyState,
    className,
    ...props
  }: AdminDataTableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const resolveRowId = React.useCallback(
    (row: T, idx: number) =>
      getRowId
        ? getRowId(row, idx)
        : String((row as { id?: string | number })?.id ?? idx),
    [getRowId],
  )

  const rowIds = React.useMemo(() => data.map(resolveRowId), [data, resolveRowId])
  const allChecked = selectable && rowIds.length > 0 && rowIds.every((id) =>
    selectedIds?.includes(id),
  )
  const noneChecked = !selectedIds?.length

  const handleHeaderSort = (col: AdminDataTableColumn<T>) => {
    if (!col.sortable || !onSort) return
    const nextDir: SortDirection =
      sortKey === col.key && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(col.key, nextDir)
  }

  const handleToggleAll = () => {
    if (!onSelect) return
    onSelect(allChecked ? [] : rowIds)
  }

  const handleToggleRow = (id: string) => {
    if (!onSelect) return
    const current = selectedIds ?? []
    onSelect(current.includes(id) ? current.filter((v) => v !== id) : [...current, id])
  }

  const showEmpty = !loading && (isEmpty ?? data.length === 0)

  return (
    <div ref={ref} className={cn('relative w-full', className)} {...props}>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              {selectable && (
                <th className="w-10 px-3 py-2 text-left">
                  <Checkbox
                    checked={allChecked}
                    onCheckedChange={handleToggleAll}
                    aria-label="すべて選択"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortKey === col.key
                const SortIcon = !col.sortable
                  ? null
                  : isSorted
                    ? sortDirection === 'asc'
                      ? ArrowUp
                      : ArrowDown
                    : ArrowUpDown
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={
                      !col.sortable
                        ? undefined
                        : isSorted
                          ? sortDirection === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                    }
                    className={cn(
                      'px-3 py-2 text-muted-foreground',
                      alignClass[col.align ?? 'left'],
                      col.className,
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleHeaderSort(col)}
                        className="inline-flex items-center gap-1 rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <span>{col.label}</span>
                        {SortIcon && (
                          <SortIcon aria-hidden="true" className="h-3.5 w-3.5" />
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {showEmpty ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  {emptyState ?? <EmptyState title="データがありません" />}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const id = rowIds[rowIndex]
                const isSelected = selectedIds?.includes(id) ?? false
                return (
                  <tr
                    key={id}
                    aria-selected={selectable ? isSelected : undefined}
                    className={cn(
                      'border-b border-border last:border-b-0',
                      isSelected && 'bg-accent/30',
                    )}
                  >
                    {selectable && (
                      <td className="w-10 px-3 py-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleRow(id)}
                          aria-label={`行 ${rowIndex + 1} を選択`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-3 py-2 text-foreground',
                          alignClass[col.align ?? 'left'],
                          col.className,
                        )}
                      >
                        {col.render
                          ? col.render(row, rowIndex)
                          : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {loading && (
        <div
          role="status"
          aria-label="読み込み中"
          className="absolute inset-0 flex items-center justify-center bg-background/60"
        >
          <Spinner />
        </div>
      )}

      {pagination && data.length > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  )
}

const AdminDataTable = React.forwardRef(AdminDataTableInner) as <T>(
  props: AdminDataTableProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => ReturnType<typeof AdminDataTableInner>

;(AdminDataTable as unknown as { displayName: string }).displayName = 'AdminDataTable'

export { AdminDataTable }
