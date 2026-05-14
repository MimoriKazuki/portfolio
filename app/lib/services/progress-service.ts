import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/app/lib/supabase/server'
import { canViewContent, canViewCourseVideo } from '@/app/lib/services/access-service'

/**
 * progress-service：視聴進捗（完了フラグのみ）の記録とコース完了判定。
 *
 * 起点：docs/backend/logic/services/progress-service.md
 *
 * 設計方針（N6 / N7 確定）：
 * - 進捗は「視聴完了の事実」のみを保持（再生位置・秒数は持たない）
 * - 進捗レコードが存在する＝視聴完了
 * - コース完了判定は所属動画件数と完了済件数のカウント比較
 * - 再視聴で completed_at を上書きしない（最初の completed_at を保持）
 *
 * 視聴権限の判定は **access-service に一元化**：
 * - markCourseVideoCompleted → canViewCourseVideo
 * - markContentCompleted     → canViewContent
 *
 * 視聴権限が無いユーザーから /complete を受け付けない（403 FORBIDDEN_NO_ACCESS）。
 *
 * クライアント方針：
 * - userId は **`e_learning_users.id`**（サロゲートPK）
 * - 呼び出し元（route / page）で auth_user_id → e_learning_users.id 解決を行う
 * - 内部は anon クライアント + RLS（自己進捗のみ操作可）で動作
 */

type AnySupabase = SupabaseClient<any, any, any>

/** route 側で HTTP に変換する業務エラー */
export type ProgressErrorCode =
  | 'FORBIDDEN_NO_ACCESS' // 視聴権限なし
  | 'NOT_FOUND' // 対象動画 / コース が存在しない
  | 'DB_ERROR'

export class ProgressError extends Error {
  constructor(public readonly code: ProgressErrorCode, message: string) {
    super(message)
    this.name = 'ProgressError'
  }
}

async function getClient(): Promise<AnySupabase> {
  return (await createClient()) as AnySupabase
}

/**
 * コース内動画の所属コース ID を取得（コース完了判定の前提）。
 * 存在しない場合は NOT_FOUND（access-service 通過後の保険）。
 */
async function fetchCourseIdByCourseVideo(
  supabase: AnySupabase,
  courseVideoId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('e_learning_course_videos')
    .select('id, chapter:e_learning_course_chapters!inner ( course_id )')
    .eq('id', courseVideoId)
    .maybeSingle()

  if (error) {
    console.error('[progress-service] fetchCourseIdByCourseVideo failed', {
      code: error.code,
      course_video_id: courseVideoId,
    })
    throw new ProgressError('DB_ERROR', 'コース内動画の所属コース取得に失敗しました')
  }
  const chapter = (data as any)?.chapter
  const courseId: string | undefined = chapter?.course_id
  if (!courseId) {
    throw new ProgressError('NOT_FOUND', 'コース内動画が見つかりません')
  }
  return courseId
}

/**
 * コース完了判定（2 SQL カウント方式）。
 * progress-service.md §コース完了判定の最適化に従い、Supabase JS では count head:true を 2 本走らせる。
 */
async function getCourseProgressCounts(
  supabase: AnySupabase,
  userId: string,
  courseId: string,
): Promise<{ total: number; completed: number }> {
  // 所属コースの全動画件数（chapter 経由）
  // count head:true で count のみ取得し payload を最小化
  const { count: totalCount, error: totalError } = await supabase
    .from('e_learning_course_videos')
    .select('id, chapter:e_learning_course_chapters!inner ( course_id )', {
      count: 'exact',
      head: true,
    })
    .eq('chapter.course_id', courseId)

  if (totalError) {
    console.error('[progress-service] total count failed', {
      code: totalError.code,
      course_id: courseId,
    })
    throw new ProgressError('DB_ERROR', 'コース動画件数の取得に失敗しました')
  }

  // 完了済件数（user_id の進捗のうち、所属コースの動画分）
  const { count: completedCount, error: completedError } = await supabase
    .from('e_learning_progress')
    .select(
      'id, course_video:e_learning_course_videos!inner ( chapter:e_learning_course_chapters!inner ( course_id ) )',
      { count: 'exact', head: true },
    )
    .eq('user_id', userId)
    .eq('course_video.chapter.course_id', courseId)

  if (completedError) {
    console.error('[progress-service] completed count failed', {
      code: completedError.code,
      course_id: courseId,
      user_id: userId,
    })
    throw new ProgressError('DB_ERROR', 'コース完了済件数の取得に失敗しました')
  }

  return { total: totalCount ?? 0, completed: completedCount ?? 0 }
}

/**
 * コース内動画の完了マーク。
 *
 * 1. access-service.canViewCourseVideo で権限チェック
 * 2. (user_id, course_video_id) UPSERT（既存があれば最初の completed_at を保持）
 * 3. コース完了判定（全動画完了で course_completed=true）
 */
export async function markCourseVideoCompleted(
  userId: string,
  courseVideoId: string,
): Promise<{ completed_at: string; course_completed: boolean }> {
  // ① 権限チェック（access-service 単一判定）
  const access = await canViewCourseVideo(userId, courseVideoId)
  if (!access.allowed) {
    throw new ProgressError('FORBIDDEN_NO_ACCESS', '視聴権限がありません')
  }

  const supabase = await getClient()

  // ② 既存進捗の存在確認（最初の completed_at を保持するため UPSERT ではなく事前 SELECT で分岐）
  const { data: existing, error: existingError } = await supabase
    .from('e_learning_progress')
    .select('id, completed_at')
    .eq('user_id', userId)
    .eq('course_video_id', courseVideoId)
    .maybeSingle()

  if (existingError) {
    console.error('[progress-service] existing select failed', {
      code: existingError.code,
      user_id: userId,
      course_video_id: courseVideoId,
    })
    throw new ProgressError('DB_ERROR', '進捗取得に失敗しました')
  }

  let completedAt: string
  if (existing) {
    completedAt = existing.completed_at as string
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from('e_learning_progress')
      .insert({
        user_id: userId,
        course_video_id: courseVideoId,
        content_id: null,
      })
      .select('completed_at')
      .single()

    if (insertError || !inserted) {
      // 並行 INSERT で UNIQUE 違反 → 既存レコードを再取得して値を返す（冪等）
      if (insertError?.code === '23505') {
        const { data: retry } = await supabase
          .from('e_learning_progress')
          .select('completed_at')
          .eq('user_id', userId)
          .eq('course_video_id', courseVideoId)
          .maybeSingle()
        if (retry?.completed_at) {
          completedAt = retry.completed_at as string
        } else {
          throw new ProgressError('DB_ERROR', '進捗の作成に失敗しました')
        }
      } else {
        console.error('[progress-service] insert failed', {
          code: insertError?.code,
          user_id: userId,
          course_video_id: courseVideoId,
        })
        throw new ProgressError('DB_ERROR', '進捗の作成に失敗しました')
      }
    } else {
      completedAt = inserted.completed_at as string
    }
  }

  // ③ コース完了判定
  const courseId = await fetchCourseIdByCourseVideo(supabase, courseVideoId)
  const { total, completed } = await getCourseProgressCounts(supabase, userId, courseId)
  // コースに動画が 1 件もない場合は course_completed=false（誤った完了判定の防止）
  const courseCompleted = total > 0 && completed >= total

  return { completed_at: completedAt, course_completed: courseCompleted }
}

/**
 * 単体動画の完了マーク。
 *
 * 1. access-service.canViewContent で権限チェック
 * 2. (user_id, content_id) UPSERT（最初の completed_at を保持）
 */
export async function markContentCompleted(
  userId: string,
  contentId: string,
): Promise<{ completed_at: string }> {
  const access = await canViewContent(userId, contentId)
  if (!access.allowed) {
    throw new ProgressError('FORBIDDEN_NO_ACCESS', '視聴権限がありません')
  }

  const supabase = await getClient()

  const { data: existing, error: existingError } = await supabase
    .from('e_learning_progress')
    .select('id, completed_at')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .maybeSingle()

  if (existingError) {
    console.error('[progress-service] existing select failed (content)', {
      code: existingError.code,
      user_id: userId,
      content_id: contentId,
    })
    throw new ProgressError('DB_ERROR', '進捗取得に失敗しました')
  }

  if (existing?.completed_at) {
    return { completed_at: existing.completed_at as string }
  }

  const { data: inserted, error: insertError } = await supabase
    .from('e_learning_progress')
    .insert({
      user_id: userId,
      content_id: contentId,
      course_video_id: null,
    })
    .select('completed_at')
    .single()

  if (insertError || !inserted) {
    if (insertError?.code === '23505') {
      const { data: retry } = await supabase
        .from('e_learning_progress')
        .select('completed_at')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .maybeSingle()
      if (retry?.completed_at) {
        return { completed_at: retry.completed_at as string }
      }
    }
    console.error('[progress-service] insert failed (content)', {
      code: insertError?.code,
      user_id: userId,
      content_id: contentId,
    })
    throw new ProgressError('DB_ERROR', '進捗の作成に失敗しました')
  }

  return { completed_at: inserted.completed_at as string }
}

/**
 * コース進捗（完了数 / 全件数）を取得。FE のコース完了率表示用。
 */
export async function getCourseProgress(
  userId: string,
  courseId: string,
): Promise<{ total: number; completed: number }> {
  const supabase = await getClient()
  return await getCourseProgressCounts(supabase, userId, courseId)
}

/**
 * コースが完了済みか bool で返す。
 */
export async function isCourseCompleted(
  userId: string,
  courseId: string,
): Promise<boolean> {
  const { total, completed } = await getCourseProgress(userId, courseId)
  return total > 0 && completed >= total
}

/**
 * コース内の完了済 course_video_id 配列を返す（FE「視聴済」マーク用）。
 */
export async function getCompletedCourseVideoIds(
  userId: string,
  courseId: string,
): Promise<string[]> {
  const supabase = await getClient()

  const { data, error } = await supabase
    .from('e_learning_progress')
    .select(
      'course_video_id, course_video:e_learning_course_videos!inner ( chapter:e_learning_course_chapters!inner ( course_id ) )',
    )
    .eq('user_id', userId)
    .eq('course_video.chapter.course_id', courseId)
    .not('course_video_id', 'is', null)

  if (error) {
    console.error('[progress-service] getCompletedCourseVideoIds failed', {
      code: error.code,
      user_id: userId,
      course_id: courseId,
    })
    throw new ProgressError('DB_ERROR', '完了済動画 ID の取得に失敗しました')
  }

  const ids: string[] = []
  for (const row of (data ?? []) as Array<{ course_video_id: string | null }>) {
    if (row.course_video_id) ids.push(row.course_video_id)
  }
  return ids
}
