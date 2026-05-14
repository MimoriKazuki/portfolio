'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Select } from '@/app/components/molecules/Select'
import { AdminFilterBar } from '@/app/components/organisms/AdminFilterBar'

/**
 * C005 管理画面コース一覧：URL query 連動フィルタ（Client Component）。
 *
 * AdminFilterBar の searchValue / filters[] スロットに合わせ：
 * - 検索：SearchField（タイトル ILIKE・debounce 300ms）
 * - filters：ステータス Select / カテゴリ Select（単一選択・運用上十分）
 *
 * 単一カテゴリ Select で運用簡素化（複数選択 UI は AdminFilterBar 仕様外のため）。
 */

const KEYWORD_DEBOUNCE_MS = 300

const STATUS_OPTIONS = [
  { value: 'published', label: '公開中' },
  { value: 'draft', label: '下書き' },
  { value: 'deleted', label: '削除済' },
  { value: 'all', label: 'すべて' },
]

export interface AdminCoursesFilterClientProps {
  categories: Array<{ value: string; label: string }>
}

export function AdminCoursesFilterClient({ categories }: AdminCoursesFilterClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get('status') ?? 'published'
  const currentCategoryId = searchParams.get('category') ?? ''
  const currentKeyword = searchParams.get('q') ?? ''
  const [keyword, setKeyword] = React.useState(currentKeyword)

  const pushWithQuery = React.useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      mutator(params)
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const handleStatusChange = (value: string) => {
    pushWithQuery(params => {
      if (value === 'published') params.delete('status')
      else params.set('status', value)
    })
  }

  const handleCategoryChange = (value: string) => {
    pushWithQuery(params => {
      if (!value) params.delete('category')
      else params.set('category', value)
    })
  }

  React.useEffect(() => {
    if (keyword === currentKeyword) return
    const timer = window.setTimeout(() => {
      pushWithQuery(params => {
        if (keyword.trim() === '') params.delete('q')
        else params.set('q', keyword.trim())
      })
    }, KEYWORD_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [keyword, currentKeyword, pushWithQuery])

  const categoryOptions = React.useMemo(
    () => [{ value: '', label: '全カテゴリ' }, ...categories],
    [categories],
  )

  return (
    <AdminFilterBar
      searchValue={keyword}
      onSearchChange={setKeyword}
      searchPlaceholder="コースタイトルで検索"
      filters={[
        <Select
          key="status"
          value={currentStatus}
          onValueChange={handleStatusChange}
          options={STATUS_OPTIONS}
          size="sm"
          aria-label="ステータス"
        />,
        <Select
          key="category"
          value={currentCategoryId}
          onValueChange={handleCategoryChange}
          options={categoryOptions}
          size="sm"
          aria-label="カテゴリ"
        />,
      ]}
    />
  )
}
