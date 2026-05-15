'use client'

import * as React from 'react'
import { Checkbox } from '@/app/components/atoms/Checkbox'
import { RadioGroup, RadioGroupItem } from '@/app/components/atoms/Radio'
import { Label } from '@/app/components/atoms/Label'
import { cn } from '@/app/lib/utils'

/**
 * MediaFilterSidebar organism（Atomic Design / organisms）
 *
 * 起点：
 * - team-lead 指示「B002 統合一覧の左フィルタ（Claude Code Academy 風）」
 * - aside / role="complementary"
 *
 * セクション構成：
 * - 種別：コース / 単体動画 のチェックボックス（複数選択）
 * - カテゴリ：複数選択チェックボックス
 * - 価格：すべて / 無料 / 有料 のラジオ
 *
 * 既存 atoms 流用：Checkbox / Radio / Label。
 * フィルタ操作は呼び出し側（Client）の state で URL query 同期。
 */

export type MediaPriceFilter = 'all' | 'free' | 'paid'

export interface MediaFilterCategory {
  id: string
  name: string
}

export interface MediaFilterSidebarProps {
  /** 選択中の種別。 */
  selectedTypes: ('course' | 'content')[]
  onTypesChange: (types: ('course' | 'content')[]) => void
  /** 選択中のカテゴリ ID 配列。 */
  selectedCategoryIds: string[]
  onCategoriesChange: (ids: string[]) => void
  /** カテゴリ選択肢。 */
  categories: MediaFilterCategory[]
  /** 価格フィルタ。 */
  priceFilter: MediaPriceFilter
  onPriceChange: (v: MediaPriceFilter) => void
  /** 追加 className。 */
  className?: string
}

function toggleArrayValue<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
}

const MediaFilterSidebar: React.FC<MediaFilterSidebarProps> = ({
  selectedTypes,
  onTypesChange,
  selectedCategoryIds,
  onCategoriesChange,
  categories,
  priceFilter,
  onPriceChange,
  className,
}) => {
  return (
    <aside
      role="complementary"
      aria-label="一覧フィルタ"
      className={cn(
        // 枠・背景なしの素のセクション（Claude Code Academy 参考・Kosuke FB 2026-05-15）
        'flex w-full flex-col gap-6 text-foreground',
        className,
      )}
    >
      {/* 種別 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">種別</h2>
        <div className="flex flex-col gap-2">
          {([
            { value: 'course' as const, label: 'コース' },
            { value: 'content' as const, label: '単体動画' },
          ]).map(opt => {
            const id = `filter-type-${opt.value}`
            const checked = selectedTypes.includes(opt.value)
            return (
              <div key={opt.value} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={() =>
                    onTypesChange(toggleArrayValue(selectedTypes, opt.value))
                  }
                />
                <Label htmlFor={id} className="cursor-pointer text-sm text-foreground">
                  {opt.label}
                </Label>
              </div>
            )
          })}
        </div>
      </section>

      {/* カテゴリ */}
      {categories.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">カテゴリ</h2>
          <div className="flex flex-col gap-2">
            {categories.map(cat => {
              const id = `filter-category-${cat.id}`
              const checked = selectedCategoryIds.includes(cat.id)
              return (
                <div key={cat.id} className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={() =>
                      onCategoriesChange(toggleArrayValue(selectedCategoryIds, cat.id))
                    }
                  />
                  <Label htmlFor={id} className="cursor-pointer text-sm text-foreground">
                    {cat.name}
                  </Label>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 価格 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">価格</h2>
        <RadioGroup
          value={priceFilter}
          onValueChange={value => onPriceChange(value as MediaPriceFilter)}
          className="flex flex-col gap-2"
        >
          {([
            { value: 'all' as const, label: 'すべて' },
            { value: 'free' as const, label: '無料のみ' },
            { value: 'paid' as const, label: '有料のみ' },
          ]).map(opt => {
            const id = `filter-price-${opt.value}`
            return (
              <div key={opt.value} className="flex items-center gap-2">
                <RadioGroupItem id={id} value={opt.value} />
                <Label htmlFor={id} className="cursor-pointer text-sm text-foreground">
                  {opt.label}
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      </section>
    </aside>
  )
}
MediaFilterSidebar.displayName = 'MediaFilterSidebar'

export { MediaFilterSidebar }
