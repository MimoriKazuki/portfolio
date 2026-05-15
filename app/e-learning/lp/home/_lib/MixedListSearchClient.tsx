'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

/**
 * B002 統合一覧（/e-learning/lp/home）の検索バー Client Component。
 *
 * 担当：URL query `q` を debounce 300ms で同期するキーワード検索 UI。
 * Kosuke FB 2026-05-15：検索バーを左カラム → 右カラム上部に移動（Claude Code Academy 参考）。
 *
 * Input atom を使わず直接 `<input>` を使う理由（Kosuke FB 2026-05-15）：
 * - Input atom 内部の `bg-background` がページ背景と同化して見づらいため、白背景・濃い border を明示。
 * - Input atom の base クラスをすべて避けることで意図せぬスタイル継承を排除し、Kosuke 環境でも確実に反映。
 * - Kosuke 側で見え方を確認する際はハードリロード（Cmd+Shift+R）でブラウザキャッシュをクリアしてください。
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
    <input
      type="search"
      placeholder="キーワードで検索"
      value={keyword}
      onChange={e => setKeyword(e.target.value)}
      aria-label="キーワード検索"
      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  )
}
