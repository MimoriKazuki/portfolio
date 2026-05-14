'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Select } from '@/app/components/molecules/Select'
import { AdminFilterBar } from '@/app/components/organisms/AdminFilterBar'

/**
 * C009 購入履歴管理：URL query 連動フィルタ。
 *
 * - 検索：display_name / email ILIKE（debounce 300ms）
 * - target：'all' / 'course' / 'content' / 'legacy'（旧 LP 全コンテンツ買い切り）
 * - status：'all' / 'completed' / 'refunded'
 */

const KEYWORD_DEBOUNCE_MS = 300

const TARGET_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'course', label: 'コース' },
  { value: 'content', label: '単体動画' },
  { value: 'legacy', label: '旧 LP（全コンテンツ）' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: '全ステータス' },
  { value: 'completed', label: '完了' },
  { value: 'refunded', label: '返金済' },
]

export function AdminPurchasesFilterClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentTarget = searchParams.get('target') ?? 'all'
  const currentStatus = searchParams.get('status') ?? 'all'
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

  const handleTarget = (value: string) => {
    pushWithQuery(params => {
      if (value === 'all') params.delete('target')
      else params.set('target', value)
    })
  }
  const handleStatus = (value: string) => {
    pushWithQuery(params => {
      if (value === 'all') params.delete('status')
      else params.set('status', value)
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

  return (
    <AdminFilterBar
      searchValue={keyword}
      onSearchChange={setKeyword}
      searchPlaceholder="ユーザー名 / メールアドレスで検索"
      filters={[
        <Select
          key="target"
          value={currentTarget}
          onValueChange={handleTarget}
          options={TARGET_OPTIONS}
          size="sm"
          aria-label="購入対象"
        />,
        <Select
          key="status"
          value={currentStatus}
          onValueChange={handleStatus}
          options={STATUS_OPTIONS}
          size="sm"
          aria-label="ステータス"
        />,
      ]}
    />
  )
}
