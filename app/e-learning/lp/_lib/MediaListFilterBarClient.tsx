'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/app/components/atoms/Input'
import { MediaFilterBar, type MediaFreeFilter } from '@/app/components/organisms/MediaFilterBar'
import type { FilterChipOption } from '@/app/components/molecules/FilterChipGroup'

/**
 * 共通：B002（コース一覧）/ B003（単体動画一覧）の URL query 連動フィルタバー（Client Component）。
 *
 * 構成：
 * - 上段：キーワード検索 Input（debounce 300ms で URL 反映）
 * - 中段：MediaFilterBar（カテゴリチップ + 無料/有料 + 並び替え）
 *
 * 設計方針：
 * - フィルタ状態は URL query が単一の真の源（既存 React state を持たず Server Component で再 fetch）
 * - 操作時に URL を `router.push` 更新（scroll: false でスクロール位置維持）
 *
 * 一覧画面共通 client。新規 path（/e-learning/lp/courses / /e-learning/lp/videos）から呼ぶ。
 */

const KEYWORD_DEBOUNCE_MS = 300

export interface MediaListFilterBarClientProps {
  categories: FilterChipOption[]
  sortOptions?: { value: string; label: string }[]
}

export function MediaListFilterBarClient({
  categories,
  sortOptions,
}: MediaListFilterBarClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // URL から現在値を抽出
  const currentCategoryIds = React.useMemo(
    () => searchParams.get('categories')?.split(',').filter(Boolean) ?? [],
    [searchParams],
  )
  const currentFreeFilter = (searchParams.get('free') ?? 'all') as MediaFreeFilter
  const currentSortBy = searchParams.get('sort') ?? undefined
  const currentKeyword = searchParams.get('q') ?? ''

  // キーワードはローカル state（debounce 用）
  const [keyword, setKeyword] = React.useState(currentKeyword)

  // URL クエリ更新ヘルパ
  const pushWithQuery = React.useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      mutator(params)
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const handleCategoryChange = React.useCallback(
    (ids: string[]) => {
      pushWithQuery(params => {
        if (ids.length === 0) {
          params.delete('categories')
        } else {
          params.set('categories', ids.join(','))
        }
      })
    },
    [pushWithQuery],
  )

  const handleFreeFilterChange = React.useCallback(
    (value: MediaFreeFilter) => {
      pushWithQuery(params => {
        if (value === 'all') {
          params.delete('free')
        } else {
          params.set('free', value)
        }
      })
    },
    [pushWithQuery],
  )

  const handleSortChange = React.useCallback(
    (value: string) => {
      pushWithQuery(params => {
        if (!value) {
          params.delete('sort')
        } else {
          params.set('sort', value)
        }
      })
    },
    [pushWithQuery],
  )

  // キーワードを debounce で URL 反映
  React.useEffect(() => {
    if (keyword === currentKeyword) return
    const timer = window.setTimeout(() => {
      pushWithQuery(params => {
        if (keyword.trim() === '') {
          params.delete('q')
        } else {
          params.set('q', keyword.trim())
        }
      })
    }, KEYWORD_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [keyword, currentKeyword, pushWithQuery])

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="search"
        placeholder="キーワードで検索"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        aria-label="キーワード検索"
      />
      <MediaFilterBar
        categories={categories}
        selectedCategoryIds={currentCategoryIds}
        onCategoryChange={handleCategoryChange}
        showFreeFilter
        freeFilter={currentFreeFilter}
        onFreeFilterChange={handleFreeFilterChange}
        sortOptions={sortOptions}
        sortBy={currentSortBy}
        onSortChange={sortOptions ? handleSortChange : undefined}
      />
    </div>
  )
}
