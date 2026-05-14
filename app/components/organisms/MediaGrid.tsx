'use client'

import * as React from 'react'
import { Spinner } from '@/app/components/atoms/Spinner'
import { EmptyState } from '@/app/components/molecules/EmptyState'
import { cn } from '@/app/lib/utils'

/**
 * MediaGrid organism（Atomic Design / organisms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md organisms § MediaGrid
 * - 対応画面：B002（コース一覧）/ B003（コンテンツ一覧）/ B006（カテゴリ一覧）
 *
 * スロット式：children に CourseCard / ContentCard 等を配置する。
 *
 * - レスポンシブグリッド：sm 1 列 / md 2 列 / lg 3 列 / xl 4 列（cols prop で上書き可）
 * - loading=true：Spinner オーバーレイ
 * - isEmpty=true（または children なし）：EmptyState（emptyState スロットで上書き可）
 *
 * 利用例：
 * ```
 * <MediaGrid loading={loading} isEmpty={items.length === 0}>
 *   {items.map((c) => <CourseCard key={c.id} {...c} />)}
 * </MediaGrid>
 * ```
 *
 * Phase 3 で CourseCard / ContentCard が実装されるまでは枠としてのみ機能する。
 */

export type MediaGridCols = 1 | 2 | 3 | 4

export interface MediaGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** ローディング状態（Spinner オーバーレイ）。 */
  loading?: boolean
  /** 明示的に空状態を指定（省略時は children の有無で判定）。 */
  isEmpty?: boolean
  /** 空状態の slot（省略時は既定 EmptyState）。 */
  emptyState?: React.ReactNode
  /** xl ブレークポイントでの最大列数（既定 4）。 */
  cols?: MediaGridCols
  children?: React.ReactNode
}

const colsClass: Record<MediaGridCols, string> = {
  1: 'sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1',
  2: 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2',
  3: 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3',
  4: 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

const MediaGrid = React.forwardRef<HTMLDivElement, MediaGridProps>(
  (
    {
      loading = false,
      isEmpty,
      emptyState,
      cols = 4,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const childArray = React.Children.toArray(children).filter(Boolean)
    const showEmpty = !loading && (isEmpty ?? childArray.length === 0)

    return (
      <div ref={ref} className={cn('relative w-full', className)} {...props}>
        {showEmpty ? (
          emptyState ?? <EmptyState title="表示できる項目がありません" />
        ) : (
          <div className={cn('grid gap-4', colsClass[cols])}>{children}</div>
        )}

        {loading && (
          <div
            role="status"
            aria-label="読み込み中"
            className="absolute inset-0 flex items-center justify-center bg-background/60"
          >
            <Spinner />
          </div>
        )}
      </div>
    )
  },
)
MediaGrid.displayName = 'MediaGrid'

export { MediaGrid }
