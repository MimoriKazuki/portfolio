'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { Select, type SelectOption } from '@/app/components/molecules/Select'

/**
 * マイラーニングの上部ドロップダウンフィルタ Client Component（Kosuke FB 2026-05-15 Udemy 風）。
 *
 * 担当：URL query の同期（単一値）
 * - type=course|content（未指定 or 'all' で省略）
 * - category={categoryId}（未指定 or 'all' で省略）
 *
 * Udemy 風 UX（Kosuke FB 2026-05-15 追加）：
 * - 未選択時のドロップダウンには「種別」「カテゴリ」がプレースホルダ風に表示される
 *   （options[0].label を "すべて" → "種別" / "カテゴリ" に変えて実現。Select molecule は無 touch）
 * - 選択後はドロップダウン右端（chevron 左）に ✕ ボタンを重ね、クリックで "all" にリセット
 * - いずれかのフィルタが選択中のときは右側に「フィルターをクリア」テキストボタンを表示し、全クリア
 *
 * 既存 molecules/Select は touch せず、外側ラッパで対応。
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

  const currentCategory = (() => {
    const v = searchParams.get('category')
    if (!v) return ALL
    // 不正な categoryId（カテゴリ一覧に存在しない）の場合も all 扱いにする
    return categories.some(c => c.id === v) ? v : ALL
  })()

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

  const handleClearAll = () => {
    pushWithQuery(params => {
      params.delete('type')
      params.delete('category')
    })
  }

  // options[0] の label をプレースホルダ風に。Select の Value 表示が "種別" / "カテゴリ" になる。
  const typeOptions: SelectOption[] = [
    { label: '種別', value: ALL },
    { label: 'コース', value: 'course' },
    { label: '単体動画', value: 'content' },
  ]

  const categoryOptions: SelectOption[] = [
    { label: 'カテゴリ', value: ALL },
    ...categories.map(c => ({ label: c.name, value: c.id })),
  ]

  const isTypeSelected = currentType !== ALL
  const isCategorySelected = currentCategory !== ALL
  const hasAnyFilter = isTypeSelected || isCategorySelected

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
      {/* 種別ドロップダウン */}
      <div className="relative sm:w-48">
        <Select
          id="mylearning-type"
          aria-label="種別フィルタ"
          value={currentType}
          onValueChange={handleTypeChange}
          // 選択時は ✕ ボタン分の右パディングを確保（chevron との衝突回避のため pr-12）
          className={isTypeSelected ? 'pr-12' : undefined}
          options={typeOptions}
        />
        {isTypeSelected && (
          <button
            type="button"
            aria-label="種別フィルタをクリア"
            onClick={e => {
              e.stopPropagation()
              handleTypeChange(ALL)
            }}
            className="absolute right-8 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* カテゴリドロップダウン */}
      <div className="relative sm:w-56">
        <Select
          id="mylearning-category"
          aria-label="カテゴリフィルタ"
          value={currentCategory}
          onValueChange={handleCategoryChange}
          className={isCategorySelected ? 'pr-12' : undefined}
          options={categoryOptions}
        />
        {isCategorySelected && (
          <button
            type="button"
            aria-label="カテゴリフィルタをクリア"
            onClick={e => {
              e.stopPropagation()
              handleCategoryChange(ALL)
            }}
            className="absolute right-8 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 全フィルタクリアボタン */}
      {hasAnyFilter && (
        <button
          type="button"
          onClick={handleClearAll}
          className="inline-flex items-center gap-1 self-start text-sm text-primary hover:underline sm:self-auto"
        >
          <X aria-hidden="true" className="h-4 w-4" />
          フィルターをクリア
        </button>
      )}
    </div>
  )
}
