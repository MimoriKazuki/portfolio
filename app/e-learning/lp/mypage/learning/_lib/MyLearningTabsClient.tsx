'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/app/lib/utils'
import type { MyLearningTab } from './get-my-learning'

/**
 * マイラーニングのタブ切替 Client Component。
 * URL query `tab=purchased|bookmarked` を同期する（既定 purchased）。
 */

interface TabDef {
  value: MyLearningTab
  label: string
}

const TABS: TabDef[] = [
  { value: 'purchased', label: '購入済み' },
  { value: 'bookmarked', label: 'ブックマーク済み' },
]

export function MyLearningTabsClient({ activeTab }: { activeTab: MyLearningTab }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSelect = React.useCallback(
    (next: MyLearningTab) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next === 'purchased') params.delete('tab')
      else params.set('tab', next)
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  return (
    <div role="tablist" aria-label="マイラーニング表示切替" className="flex gap-2 border-b border-border">
      {TABS.map(tab => {
        const isActive = activeTab === tab.value
        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => handleSelect(tab.value)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm transition-colors',
              isActive
                ? 'border-primary text-foreground font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
