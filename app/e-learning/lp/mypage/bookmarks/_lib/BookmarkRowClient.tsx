'use client'

import * as React from 'react'
import Link from 'next/link'
import { BookmarkX, Loader2 } from 'lucide-react'
import { Button } from '@/app/components/atoms/Button'
import { Badge } from '@/app/components/atoms/Badge'
import {
  removeBookmarkAction,
  type RemoveBookmarkResult,
} from '../_actions/remove-bookmark'
import type { BookmarkDetail } from './get-bookmarks-detail'

/**
 * B012 マイページ：ブックマーク 1 件の表示行（Client Component）。
 *
 * 「解除」ボタンクリックで Server Action 経由 bookmark-service.remove を呼び、成功時は楽観的に行を非表示にする。
 */

export interface BookmarkRowClientProps {
  bookmark: BookmarkDetail
}

export function BookmarkRowClient({ bookmark }: BookmarkRowClientProps) {
  const [removed, setRemoved] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const detailHref =
    bookmark.type === 'course'
      ? bookmark.course_slug
        ? `/e-learning/lp/courses/${bookmark.course_slug}`
        : null
      : `/e-learning/${bookmark.target_id}`

  const handleRemove = async () => {
    if (loading || removed) return
    setLoading(true)
    setError(null)
    try {
      const result: RemoveBookmarkResult = await removeBookmarkAction(bookmark.id)
      if (result.success === true) {
        setRemoved(true)
      } else if (result.success === false) {
        if (result.code === 'NOT_FOUND') {
          // 既に消えている扱い
          setRemoved(true)
        } else {
          setError('ブックマーク解除に失敗しました')
        }
      }
    } catch (err) {
      console.error('[b012] remove bookmark error', err)
      setError('ブックマーク解除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (removed) return null

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge variant={bookmark.type === 'course' ? 'info' : 'neutral'}>
            {bookmark.type === 'course' ? 'コース' : '単体動画'}
          </Badge>
        </div>
        <p className="truncate text-sm text-foreground">
          {bookmark.title ?? '（タイトル不明）'}
        </p>
        {error && (
          <span role="alert" className="text-xs text-destructive">
            {error}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {detailHref && (
          <Button asChild size="sm" variant="outline">
            <Link href={detailHref}>視聴する</Link>
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRemove}
          disabled={loading}
          aria-label="ブックマーク解除"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <BookmarkX className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </li>
  )
}
