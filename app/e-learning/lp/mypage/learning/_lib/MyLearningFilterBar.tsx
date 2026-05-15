'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Select, type SelectOption } from '@/app/components/molecules/Select'

/**
 * マイラーニングの上部ドロップダウンフィルタ Client Component（Kosuke FB 2026-05-15 Udemy 風）。
 *
 * 担当：URL query の同期（単一値）
 * - type=course|content（未指定 or 'all' で省略）
 * - category={categoryId}（未指定 or 'all' で省略）
 *
 * 旧 MyLearningFilterClient（左カラムサイドバー / 複数チェックボックス）はこのコンポーネントで置換。
 * 既存 molecules/Select を流用（単一値選択）。
 */

const ALL = 'all'

export interface MyLearningCategory {
  id: string
  name: string
}

export interface MyLearningFilterBarProps {
  categories: MyLearningCategory[]
}

export function MyLearningFilterBar({ categories }: MyLearningFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentType = (() => {
    const v = searchParams.get('type')
    return v === 'course' || v === 'content' ? v : ALL
  })()

  const currentCategory = searchParams.get('category') ?? ALL

  const pushWithQuery = React.useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      mutator(params)
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const handleTypeChange = (value: string) => {
    pushWithQuery(params => {
      if (value === ALL) params.delete('type')
      else params.set('type', value)
    })
  }

  const handleCategoryChange = (value: string) => {
    pushWithQuery(params => {
      if (value === ALL) params.delete('category')
      else params.set('category', value)
    })
  }

  const typeOptions: SelectOption[] = [
    { label: 'すべて', value: ALL },
    { label: 'コース', value: 'course' },
    { label: '単体動画', value: 'content' },
  ]

  const categoryOptions: SelectOption[] = [
    { label: 'すべて', value: ALL },
    ...categories.map(c => ({ label: c.name, value: c.id })),
  ]

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex flex-col gap-1 sm:w-48">
        <label htmlFor="mylearning-type" className="text-xs font-medium text-muted-foreground">
          種別
        </label>
        <Select
          id="mylearning-type"
          aria-label="種別フィルタ"
          value={currentType}
          onValueChange={handleTypeChange}
          options={typeOptions}
        />
      </div>
      <div className="flex flex-col gap-1 sm:w-56">
        <label htmlFor="mylearning-category" className="text-xs font-medium text-muted-foreground">
          カテゴリ
        </label>
        <Select
          id="mylearning-category"
          aria-label="カテゴリフィルタ"
          value={currentCategory}
          onValueChange={handleCategoryChange}
          options={categoryOptions}
        />
      </div>
    </div>
  )
}
