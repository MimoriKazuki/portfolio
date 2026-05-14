'use client'

import * as React from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/app/components/atoms/Button'
import { markCourseVideoCompletedAction } from '../_actions/mark-video-completed'

/**
 * B005 コース内動画視聴：完了マークボタン（Client Component）。
 *
 * Server Action 完了後、コース完了時はトースト表示も検討対象だが本 Phase 3 段階では
 * 簡易表示（ボタン側のラベル切替）のみで対応。
 */

export interface CompleteButtonClientProps {
  courseSlug: string
  courseVideoId: string
  initialCompleted: boolean
}

export function CompleteButtonClient({
  courseSlug,
  courseVideoId,
  initialCompleted,
}: CompleteButtonClientProps) {
  const [completed, setCompleted] = React.useState(initialCompleted)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [courseCompleted, setCourseCompleted] = React.useState(false)

  const handleClick = async () => {
    if (completed || loading) return
    setLoading(true)
    setError(null)
    try {
      const result = await markCourseVideoCompletedAction(courseSlug, courseVideoId)
      if (result.success === true) {
        setCompleted(true)
        if (result.course_completed) setCourseCompleted(true)
      } else if (result.success === false) {
        setError(
          result.code === 'FORBIDDEN_NO_ACCESS'
            ? '視聴権限がありません'
            : result.code === 'UNAUTHENTICATED'
              ? 'ログインが必要です'
              : '完了マークに失敗しました',
        )
      }
    } catch (err) {
      console.error('[b005] complete button error', err)
      setError('完了マークに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleClick}
        disabled={completed || loading}
        variant={completed ? 'outline' : 'primary'}
        size="md"
        aria-label={completed ? '視聴済' : 'この動画を視聴完了にする'}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            記録中...
          </>
        ) : (
          <>
            <CheckCircle2
              className="mr-2 h-4 w-4"
              fill={completed ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
            {completed ? '視聴済' : '視聴完了にする'}
          </>
        )}
      </Button>
      {courseCompleted && (
        <p className="text-sm text-primary" role="status">
          コースをすべて視聴しました
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
