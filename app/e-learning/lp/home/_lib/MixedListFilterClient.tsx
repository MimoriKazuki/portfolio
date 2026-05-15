'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/app/components/atoms/Input'
import {
  MediaFilterSidebar,
  type MediaPriceFilter,
  type MediaFilterCategory,
} from '@/app/components/organisms/MediaFilterSidebar'

/**
 * B002 統合一覧（/e-learning/lp/home）の左フィルタ + 検索バー Client Component。
 *
 * URL query 同期方針：
 * - types: "course,content" のカンマ区切り（空なら未指定）
 * - categories: "id1,id2" カンマ区切り
 * - price: "all" | "free" | "paid"（既定 all は省略）
 * - q: キーワード（debounce 300ms）
 *
 * MediaListFilterBarClient（既存）の URL 同期パターンを踏襲。
 */

const KEYWORD_DEBOUNCE_MS = 300

export interface MixedListFilterClientProps {
  categories: MediaFilterCategory[]
}

export function MixedListFilterClient({ categories }: MixedListFilterClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // URL からの現在値抽出
  const currentTypes = React.useMemo(() => {
    const raw = searchParams.get('types')
    if (!raw) return [] as ('course' | 'content')[]
    return raw
      .split(',')
      .filter(v => v === 'course' || v === 'content') as ('course' | 'content')[]
  }, [searchParams])

  const currentCategoryIds = React.useMemo(
    () => searchParams.get('categories')?.split(',').filter(Boolean) ?? [],
    [searchParams],
  )

  const priceParam = searchParams.get('price')
  const currentPriceFilter: MediaPriceFilter =
    priceParam === 'free' || priceParam === 'paid' ? priceParam : 'all'

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

  const handleTypesChange = React.useCallback(
    (types: ('course' | 'content')[]) => {
      pushWithQuery(params => {
        if (types.length === 0) params.delete('types')
        else params.set('types', types.join(','))
      })
    },
    [pushWithQuery],
  )

  const handleCategoriesChange = React.useCallback(
    (ids: string[]) => {
      pushWithQuery(params => {
        if (ids.length === 0) params.delete('categories')
        else params.set('categories', ids.join(','))
      })
    },
    [pushWithQuery],
  )

  const handlePriceChange = React.useCallback(
    (v: MediaPriceFilter) => {
      pushWithQuery(params => {
        if (v === 'all') params.delete('price')
        else params.set('price', v)
      })
    },
    [pushWithQuery],
  )

  // キーワード debounce 反映
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

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="search"
        placeholder="キーワードで検索"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        aria-label="キーワード検索"
      />
      <MediaFilterSidebar
        selectedTypes={currentTypes}
        onTypesChange={handleTypesChange}
        selectedCategoryIds={currentCategoryIds}
        onCategoriesChange={handleCategoriesChange}
        categories={categories}
        priceFilter={currentPriceFilter}
        onPriceChange={handlePriceChange}
      />
    </div>
  )
}
