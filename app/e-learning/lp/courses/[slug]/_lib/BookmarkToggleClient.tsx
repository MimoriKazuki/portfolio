'use client'

import * as React from 'react'
import { Bookmark } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import {
  toggleBookmarkAction,
  type ToggleBookmarkErrorCode,
  type ToggleBookmarkResult,
} from '../_actions/toggle-bookmark'

/**
 * B004 コース詳細のブックマークトグルボタン Client Component。
 *
 * - 楽観 UI 更新：クリック直後に見た目を切り替え、Server Action 失敗時にロールバック
 * - B007（ELearningDetailClient）の rounded-full ボタンと同流儀
 * - エラー時は alert（B007 と同流儀の簡易通知）。多重クリック防止のため pending 中は disabled
 * - 文字色は text-yellow-700 / text-gray-700（B007 は -600・コントラスト観点で本実装は -700。
 *   将来全画面統一する場合は B007 側を -700 に揃える方針）。
 */

export interface BookmarkToggleClientProps {
  courseId: string
  courseSlug: string
  /** SSR 時点でのブックマーク状態。 */
  initialBookmarked: boolean
  /** SSR 時点でのブックマーク行 ID（削除時に必要・未ブックマークなら null）。 */
  initialBookmarkId: string | null
}

const ERROR_MESSAGES: Record<ToggleBookmarkErrorCode, string> = {
  UNAUTHORIZED: 'ログインが必要です。再度ログインしてください。',
  NOT_FOUND: 'ブックマークが見つかりません。ページを再読み込みしてください。',
  ALREADY_EXISTS: '既にブックマークされています。',
  BAD_REQUEST: '操作できませんでした。ページを再読み込みしてください。',
  DB_ERROR: '一時的なエラーが発生しました。時間をおいて再度お試しください。',
}

export function BookmarkToggleClient({
  courseId,
  courseSlug,
  initialBookmarked,
  initialBookmarkId,
}: BookmarkToggleClientProps) {
  const [isBookmarked, setIsBookmarked] = React.useState(initialBookmarked)
  const [bookmarkId, setBookmarkId] = React.useState<string | null>(initialBookmarkId)
  const [isPending, startTransition] = React.useTransition()

  const handleClick = () => {
    if (isPending) return
    const previousBookmarked = isBookmarked
    const previousBookmarkId = bookmarkId

    // 楽観 UI 更新
    setIsBookmarked(!previousBookmarked)
    if (previousBookmarked) setBookmarkId(null)

    startTransition(async () => {
      const result: ToggleBookmarkResult = await toggleBookmarkAction({
        courseId,
        courseSlug,
        currentlyBookmarked: previousBookmarked,
        bookmarkId: previousBookmarkId,
      })
      if (result.ok === true) {
        setIsBookmarked(result.isBookmarked)
        setBookmarkId(result.bookmarkId)
        return
      }
      // ロールバック + エラー表示
      setIsBookmarked(previousBookmarked)
      setBookmarkId(previousBookmarkId)
      if (typeof window !== 'undefined') {
        window.alert(ERROR_MESSAGES[result.error])
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? 'ブックマークを解除' : 'ブックマークに追加'}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium transition-all',
        isBookmarked
          ? 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
        isPending && 'cursor-not-allowed opacity-60',
      )}
    >
      <Bookmark
        aria-hidden="true"
        className={cn('h-4 w-4', isBookmarked && 'fill-current')}
      />
      {isBookmarked ? 'ブックマーク済み' : 'ブックマーク'}
    </button>
  )
}
