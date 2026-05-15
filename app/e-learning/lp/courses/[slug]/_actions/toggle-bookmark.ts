'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'
import {
  add as addBookmark,
  remove as removeBookmark,
  BookmarkError,
} from '@/app/lib/services/bookmark-service'

/**
 * B004 コース詳細のブックマークトグル Server Action。
 *
 * - 認証必須（auth.getUser）。未ログイン → 401
 * - e_learning_users.id を解決し、bookmark-service.add / remove を呼ぶ
 * - 楽観 UI のため新しい状態（isBookmarked / bookmarkId）を返す
 * - エラーは BookmarkError → ToggleBookmarkError コードに変換し Client で扱える形に
 * - 成功時に `/e-learning/lp/courses/[slug]` を revalidate
 */

export type ToggleBookmarkErrorCode =
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'ALREADY_EXISTS'
  | 'BAD_REQUEST'
  | 'DB_ERROR'

export interface ToggleBookmarkSuccess {
  ok: true
  isBookmarked: boolean
  bookmarkId: string | null
}

export interface ToggleBookmarkFailure {
  ok: false
  error: ToggleBookmarkErrorCode
}

export type ToggleBookmarkResult = ToggleBookmarkSuccess | ToggleBookmarkFailure

export interface ToggleBookmarkInput {
  courseId: string
  courseSlug: string
  /** 現在の状態（true なら remove、false なら add）。 */
  currentlyBookmarked: boolean
  /** remove 時に必要（currentlyBookmarked=true の場合）。 */
  bookmarkId?: string | null
}

export async function toggleBookmarkAction(
  input: ToggleBookmarkInput,
): Promise<ToggleBookmarkResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'UNAUTHORIZED' }

  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!eLearningUser) return { ok: false, error: 'UNAUTHORIZED' }

  try {
    if (input.currentlyBookmarked) {
      if (!input.bookmarkId) return { ok: false, error: 'BAD_REQUEST' }
      await removeBookmark(eLearningUser.id, input.bookmarkId)
      revalidatePath(`/e-learning/lp/courses/${input.courseSlug}`)
      return { ok: true, isBookmarked: false, bookmarkId: null }
    } else {
      const created = await addBookmark(eLearningUser.id, 'course', input.courseId)
      revalidatePath(`/e-learning/lp/courses/${input.courseSlug}`)
      return { ok: true, isBookmarked: true, bookmarkId: created.id }
    }
  } catch (err) {
    if (err instanceof BookmarkError) {
      return { ok: false, error: err.code }
    }
    console.error('[toggle-bookmark] unexpected error', {
      message: err instanceof Error ? err.message : String(err),
    })
    return { ok: false, error: 'DB_ERROR' }
  }
}
