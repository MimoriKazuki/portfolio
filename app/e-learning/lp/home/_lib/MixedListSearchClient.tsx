'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/app/components/atoms/Input'

/**
 * B002 統合一覧（/e-learning/lp/home）の検索バー Client Component。
 *
 * 担当：URL query `q` を debounce 300ms で同期するキーワード検索 UI。
 * Kosuke FB 2026-05-15：検索バーを左カラム → 右カラム上部に移動（Claude Code Academy 参考）。
 */

const KEYWORD_DEBOUNCE_MS = 300

export function MixedListSearchClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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
    <Input
      type="search"
      placeholder="キーワードで検索"
      value={keyword}
      onChange={e => setKeyword(e.target.value)}
      aria-label="キーワード検索"
      // 白背景 + border 強化 + shadow で「フィールド感」を出す（Kosuke FB 2026-05-15）
      className="bg-white border-gray-300 shadow-sm"
    />
  )
}
