'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  MediaFilterSidebar,
  type MediaPriceFilter,
  type MediaFilterCategory,
} from '@/app/components/organisms/MediaFilterSidebar'

/**
 * B002 統合一覧（/e-learning/lp/home）の左フィルタ Client Component。
 *
 * 担当：種別 / カテゴリ / 価格 のフィルタ（URL query 同期）
 * 検索バー（q）は MixedListSearchClient に分離（Kosuke FB 2026-05-15：検索バーを右カラム上部に移動）
 *
 * URL query 同期方針：
 * - types: "course,content" のカンマ区切り（空なら未指定）
 * - categories: "id1,id2" カンマ区切り
 * - price: "all" | "free" | "paid"（既定 all は省略）
 */

export interface MixedListFilterClientProps {
  categories: MediaFilterCategory[]
}

export function MixedListFilterClient({ categories }: MixedListFilterClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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

  return (
    <MediaFilterSidebar
      selectedTypes={currentTypes}
      onTypesChange={handleTypesChange}
      selectedCategoryIds={currentCategoryIds}
      onCategoriesChange={handleCategoriesChange}
      categories={categories}
      priceFilter={currentPriceFilter}
      onPriceChange={handlePriceChange}
    />
  )
}
