'use client'

import * as React from 'react'
import { FilterChipGroup, type FilterChipOption } from '@/app/components/molecules/FilterChipGroup'
import { Select, type SelectOption } from '@/app/components/molecules/Select'
import { cn } from '@/app/lib/utils'

/**
 * MediaFilterBar organism（Atomic Design / organisms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md organisms § MediaFilterBar
 * - 対応画面：B002（コース一覧）/ B003（コンテンツ一覧）/ B006（カテゴリ一覧）
 *
 * 構成：
 * - 上段：カテゴリ FilterChipGroup（任意・カテゴリが渡されたときのみ）
 * - 下段：[ 無料/有料フィルタ FilterChipGroup ]  +  [ 並び替え Select ]
 *
 * カテゴリは複数選択（multiple=true）、無料/有料は単一選択（multiple=false・resetValue='all'）。
 * いずれも controlled。`onCategoryChange` 等が省略された場合はその領域を表示しない。
 */

export type MediaFreeFilter = 'all' | 'free' | 'paid'

export type MediaSortOption = SelectOption

export interface MediaFilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** カテゴリ一覧（省略時はカテゴリチップ非表示）。 */
  categories?: FilterChipOption[]
  /** 選択中カテゴリ ID 配列。 */
  selectedCategoryIds?: string[]
  /** カテゴリ変更コールバック。 */
  onCategoryChange?: (ids: string[]) => void

  /** 無料/有料フィルタ表示 ON/OFF。 */
  showFreeFilter?: boolean
  /** 無料/有料フィルタの現在値（既定 'all'）。 */
  freeFilter?: MediaFreeFilter
  /** 無料/有料フィルタ変更コールバック。 */
  onFreeFilterChange?: (value: MediaFreeFilter) => void

  /** 並び替えオプション（省略時は並び替え非表示）。 */
  sortOptions?: MediaSortOption[]
  /** 現在の並び替え値。 */
  sortBy?: string
  /** 並び替え変更コールバック。 */
  onSortChange?: (value: string) => void
}

const FREE_OPTIONS: FilterChipOption[] = [
  { label: 'すべて', value: 'all' },
  { label: '無料', value: 'free' },
  { label: '有料', value: 'paid' },
]

const MediaFilterBar = React.forwardRef<HTMLDivElement, MediaFilterBarProps>(
  (
    {
      categories,
      selectedCategoryIds = [],
      onCategoryChange,
      showFreeFilter = false,
      freeFilter = 'all',
      onFreeFilterChange,
      sortOptions,
      sortBy,
      onSortChange,
      className,
      ...props
    },
    ref,
  ) => {
    const showCategories = !!categories && categories.length > 0 && !!onCategoryChange
    const showSort = !!sortOptions && sortOptions.length > 0 && !!onSortChange

    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-3', className)}
        {...props}
      >
        {showCategories && (
          <FilterChipGroup
            options={categories!}
            selected={selectedCategoryIds}
            onChange={onCategoryChange!}
            multiple
            aria-label="カテゴリ"
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {showFreeFilter && onFreeFilterChange ? (
            <FilterChipGroup
              options={FREE_OPTIONS}
              selected={[freeFilter]}
              onChange={(values) =>
                onFreeFilterChange((values[0] ?? 'all') as MediaFreeFilter)
              }
              multiple={false}
              resetValue="all"
              aria-label="無料／有料"
            />
          ) : (
            <span />
          )}

          {showSort && (
            <div className="min-w-40 md:max-w-56">
              <Select
                value={sortBy}
                onValueChange={onSortChange!}
                options={sortOptions!}
                size="sm"
                aria-label="並び替え"
              />
            </div>
          )}
        </div>
      </div>
    )
  },
)
MediaFilterBar.displayName = 'MediaFilterBar'

export { MediaFilterBar }
