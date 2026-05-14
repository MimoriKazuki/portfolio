'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Select } from '@/app/components/molecules/Select'
import { AdminFilterBar } from '@/app/components/organisms/AdminFilterBar'

/**
 * C010 フルアクセスユーザー管理：URL query 連動フィルタ（Client Component）。
 *
 * - 検索：display_name / email を ILIKE（debounce 300ms）
 * - has_full_access：'all' / 'true'（付与済）/ 'false'（未付与）
 */

const KEYWORD_DEBOUNCE_MS = 300

const ACCESS_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'true', label: '付与済' },
  { value: 'false', label: '未付与' },
]

export function AdminUsersFilterClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentAccess = searchParams.get('access') ?? 'all'
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

  const handleAccessChange = (value: string) => {
    pushWithQuery(params => {
      if (value === 'all') params.delete('access')
      else params.set('access', value)
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
      searchPlaceholder="表示名 / メールアドレスで検索"
      filters={[
        <Select
          key="access"
          value={currentAccess}
          onValueChange={handleAccessChange}
          options={ACCESS_OPTIONS}
          size="sm"
          aria-label="フルアクセス"
        />,
      ]}
    />
  )
}
