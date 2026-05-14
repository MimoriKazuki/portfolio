'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'
import { markContentCompleted, ProgressError } from '@/app/lib/services/progress-service'

/**
 * B007 単体動画詳細：視聴完了マークの Server Action。
 *
 * 起点：docs/backend/logic/services/progress-service.md §markContentCompleted
 *
 * フロー：
 * 1. Supabase Auth から auth.users.id を取得
 * 2. e_learning_users.id を解決（access-service / progress-service は e_learning_users.id を引数に取る）
 * 3. progress-service.markContentCompleted を呼ぶ（権限チェック + UPSERT + コース完了判定）
 * 4. revalidatePath で B007 ページを再生成（hasCompleted の最新値を反映）
 *
 * 戻り値：
 *   - success: true / completed_at: ISO string ※既存進捗があれば最初の completed_at
 *   - 失敗時は { success: false, code }（FE 側でメッセージ整形）
 */

export type MarkContentCompletedResult =
  | { success: true; completed_at: string }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN_NO_ACCESS' | 'NOT_FOUND' | 'DB_ERROR' }

export async function markContentCompletedAction(
  contentId: string,
): Promise<MarkContentCompletedResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!eLearningUser) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  try {
    const result = await markContentCompleted(eLearningUser.id, contentId)
    revalidatePath(`/e-learning/${contentId}`)
    return { success: true, completed_at: result.completed_at }
  } catch (err) {
    if (err instanceof ProgressError) {
      return { success: false, code: err.code }
    }
    console.error('[b007] markContentCompletedAction unexpected error', {
      message: err instanceof Error ? err.message : String(err),
    })
    return { success: false, code: 'DB_ERROR' }
  }
}
