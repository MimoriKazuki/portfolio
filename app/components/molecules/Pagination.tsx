'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/app/components/atoms/Button'
import { cn } from '@/app/lib/utils'

/**
 * Pagination molecule（Atomic Design / molecules）
 *
 * 起点：
 * - docs/frontend/component-candidates.md molecules § Pagination
 * - 構成：Button（atoms）× N + 件数表示
 *
 * 利用例：
 * ```
 * <Pagination
 *   currentPage={page}
 *   totalPages={Math.ceil(total / pageSize)}
 *   onPageChange={setPage}
 *   siblingCount={1}
 * />
 * ```
 *
 * 仕様：
 * - 表示モデル：[前へ] [1] ... [page-1] [page] [page+1] ... [last] [次へ]
 * - siblingCount：現在ページの左右に表示する隣接ページ数（既定 1）
 * - 端の省略：先頭・末尾は常に表示し、間隔が空く場合は `...`（MoreHorizontal）で省略
 * - totalPages <= 1 の場合は何も描画しない
 * - aria：nav に `aria-label="ページネーション"`、現在ページに `aria-current="page"`
 */

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  /** 現在のページ（1 始まり）。 */
  currentPage: number
  /** 総ページ数（1 始まり）。 */
  totalPages: number
  /** ページ変更コールバック。 */
  onPageChange: (page: number) => void
  /** 現在ページの左右に表示する隣接ページ数。既定 1。 */
  siblingCount?: number
}

const DOTS = 'dots' as const
type PageItem = number | typeof DOTS

const range = (start: number, end: number): number[] => {
  const length = end - start + 1
  return Array.from({ length }, (_, i) => start + i)
}

const buildPageItems = (
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): PageItem[] => {
  const totalShownPages = siblingCount * 2 + 5
  if (totalPages <= totalShownPages) {
    return range(1, totalPages)
  }

  const leftSibling = Math.max(currentPage - siblingCount, 2)
  const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1)
  const showLeftDots = leftSibling > 2
  const showRightDots = rightSibling < totalPages - 1

  const items: PageItem[] = [1]
  if (showLeftDots) items.push(DOTS)
  items.push(...range(leftSibling, rightSibling))
  if (showRightDots) items.push(DOTS)
  items.push(totalPages)
  return items
}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    { currentPage, totalPages, onPageChange, siblingCount = 1, className, ...props },
    ref,
  ) => {
    if (totalPages <= 1) return null

    const items = buildPageItems(currentPage, totalPages, siblingCount)
    const isFirst = currentPage <= 1
    const isLast = currentPage >= totalPages

    return (
      <nav
        ref={ref}
        aria-label="ページネーション"
        className={cn('flex items-center justify-center gap-1', className)}
        {...props}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirst}
          aria-label="前のページ"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">前へ</span>
        </Button>

        {items.map((item, idx) =>
          item === DOTS ? (
            <span
              key={`dots-${idx}`}
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <Button
              key={item}
              variant={item === currentPage ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(item)}
              aria-label={`ページ ${item}`}
              aria-current={item === currentPage ? 'page' : undefined}
              className="min-w-9"
            >
              {item}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLast}
          aria-label="次のページ"
        >
          <span className="mr-1 hidden sm:inline">次へ</span>
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </nav>
    )
  },
)
Pagination.displayName = 'Pagination'

export { Pagination }
