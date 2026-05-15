'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { Select, type SelectOption } from '@/app/components/molecules/Select'
import { cn } from '@/app/lib/utils'

/**
 * マイラーニングの上部ドロップダウンフィルタ Client Component（Kosuke FB 2026-05-15 Udemy 風）。
 *
 * 担当：URL query の同期（単一値）
 * - type=course|content（未指定 or 'all' で省略）
 * - category={categoryId}（未指定 or 'all' で省略）
 *
 * Udemy 風 UX（Kosuke FB 2026-05-15 反映）：
 * - 未選択時のドロップダウンには「種別」「カテゴリ」が placeholder として表示される
 *   （molecules/Select の placeholder prop + value=undefined で実現）
 * - 選択肢には「種別」「カテゴリ」自体は含めない（コース / 単体動画 / カテゴリ各種 のみ）。
 *   クリアは ✕ ボタンと「フィルターをクリア」リンクから行う。
 * - 選択後はドロップダウン右端（chevron 跡）に ✕ ボタンを重ね、クリックで未選択へリセット
 * - いずれかのフィルタが選択中のときは右側に「フィルターをクリア」テキストボタンを表示し、全クリア
 * - 選択時は ChevronDown を CSS で非表示（Trigger ＝ wrapper の first-child button 内 svg）
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

  // 選択肢に「種別」「カテゴリ」自体は含めない。未選択時の表示は Select の placeholder で実現する。
  const typeOptions: SelectOption[] = [
    { label: 'コース', value: 'course' },
    { label: '単体動画', value: 'content' },
  ]

  const categoryOptions: SelectOption[] = categories.map(c => ({
    label: c.name,
    value: c.id,
  }))

  const isTypeSelected = currentType !== ALL
  const isCategorySelected = currentCategory !== ALL
  const hasAnyFilter = isTypeSelected || isCategorySelected

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
      {/* 種別ドロップダウン
          選択時は Select Trigger（wrapper の first-child = button）内の ChevronDown を CSS で非表示にし、
          ✕ アイコンのみ表示する。`first-child` を絞ることで ✕ ボタン側の svg は消さない。 */}
      <div
        className={cn(
          'relative sm:w-48',
          isTypeSelected && '[&>button:first-child>svg]:hidden',
        )}
      >
        <Select
          id="mylearning-type"
          aria-label="種別フィルタ"
          placeholder="種別"
          value={isTypeSelected ? currentType : undefined}
          onValueChange={handleTypeChange}
          // 選択時は ✕ ボタン分の右パディング確保（chevron は CSS で消すため pr-10 で十分）
          className={isTypeSelected ? 'pr-10' : undefined}
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
            className="absolute right-2 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* カテゴリドロップダウン（種別と同流儀） */}
      <div
        className={cn(
          'relative sm:w-56',
          isCategorySelected && '[&>button:first-child>svg]:hidden',
        )}
      >
        <Select
          id="mylearning-category"
          aria-label="カテゴリフィルタ"
          placeholder="カテゴリ"
          value={isCategorySelected ? currentCategory : undefined}
          onValueChange={handleCategoryChange}
          className={isCategorySelected ? 'pr-10' : undefined}
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
            className="absolute right-2 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
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
