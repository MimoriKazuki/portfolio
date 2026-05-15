'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Checkbox } from '@/app/components/atoms/Checkbox'
import { Label } from '@/app/components/atoms/Label'

/**
 * マイラーニングの左フィルタ Client Component（種別 + カテゴリ・価格セクションなし）。
 *
 * 担当：URL query の同期
 * - types: 'course,content' カンマ区切り
 * - categories: 'id,id' カンマ区切り
 *
 * 設計：MediaFilterSidebar（organism）は B002 専用で price フィルタを持つため、
 * マイラーニング用にはここで局所的に Checkbox + Label を組んでサイドバー UI を作る。
 * tab（purchased/bookmarked）は別 Client（MyLearningTabClient）が担う。
 */

export interface MyLearningCategory {
  id: string
  name: string
}

export interface MyLearningFilterClientProps {
  categories: MyLearningCategory[]
}

function toggleArrayValue<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
}

export function MyLearningFilterClient({ categories }: MyLearningFilterClientProps) {
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

  const pushWithQuery = React.useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      mutator(params)
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const handleTypesChange = (types: ('course' | 'content')[]) => {
    pushWithQuery(params => {
      if (types.length === 0) params.delete('types')
      else params.set('types', types.join(','))
    })
  }

  const handleCategoriesChange = (ids: string[]) => {
    pushWithQuery(params => {
      if (ids.length === 0) params.delete('categories')
      else params.set('categories', ids.join(','))
    })
  }

  return (
    <aside
      role="complementary"
      aria-label="マイラーニングフィルタ"
      className="flex w-full flex-col gap-6 text-foreground"
    >
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">種別</h2>
        <div className="flex flex-col gap-2">
          {([
            { value: 'course' as const, label: 'コース' },
            { value: 'content' as const, label: '単体動画' },
          ]).map(opt => {
            const id = `mylearning-type-${opt.value}`
            const checked = currentTypes.includes(opt.value)
            return (
              <div key={opt.value} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={() =>
                    handleTypesChange(toggleArrayValue(currentTypes, opt.value))
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

      {categories.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">カテゴリ</h2>
          <div className="flex flex-col gap-2">
            {categories.map(cat => {
              const id = `mylearning-category-${cat.id}`
              const checked = currentCategoryIds.includes(cat.id)
              return (
                <div key={cat.id} className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={() =>
                      handleCategoriesChange(toggleArrayValue(currentCategoryIds, cat.id))
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
    </aside>
  )
}
