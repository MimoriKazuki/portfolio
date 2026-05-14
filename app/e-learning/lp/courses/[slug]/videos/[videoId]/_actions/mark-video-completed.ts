'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'
import {
  markCourseVideoCompleted,
  ProgressError,
} from '@/app/lib/services/progress-service'

/**
 * B005 コース内動画視聴：完了マーク Server Action。
 *
 * 起点：docs/backend/logic/services/progress-service.md §markCourseVideoCompleted
 *
 * フロー：
 * 1. Supabase Auth から auth.users.id を取得
 * 2. e_learning_users.id を解決
 * 3. progress-service.markCourseVideoCompleted を呼ぶ（権限チェック + UPSERT + コース完了判定）
 * 4. revalidatePath で B005 ページとコース詳細ページを再生成
 */

export type MarkCourseVideoCompletedResult =
  | { success: true; completed_at: string; course_completed: boolean }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN_NO_ACCESS' | 'NOT_FOUND' | 'DB_ERROR' }

export async function markCourseVideoCompletedAction(
  courseSlug: string,
  courseVideoId: string,
): Promise<MarkCourseVideoCompletedResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, code: 'UNAUTHENTICATED' }

  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!eLearningUser) return { success: false, code: 'UNAUTHENTICATED' }

  try {
    const result = await markCourseVideoCompleted(eLearningUser.id, courseVideoId)
    revalidatePath(`/e-learning/lp/courses/${courseSlug}/videos/${courseVideoId}`)
    revalidatePath(`/e-learning/lp/courses/${courseSlug}`)
    return {
      success: true,
      completed_at: result.completed_at,
      course_completed: result.course_completed,
    }
  } catch (err) {
    if (err instanceof ProgressError) {
      return { success: false, code: err.code }
    }
    console.error('[b005] markCourseVideoCompletedAction unexpected error', {
      message: err instanceof Error ? err.message : String(err),
    })
    return { success: false, code: 'DB_ERROR' }
  }
}
