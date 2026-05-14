'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'
import { requireAdmin } from '@/app/lib/auth/admin-guard'

/**
 * C005 管理画面コース一覧：公開／非公開切替 Server Action。
 *
 * フロー：
 * 1. requireAdmin で管理者認証（多層防御）
 * 2. e_learning_courses.is_published を反転 UPDATE
 * 3. revalidatePath で一覧を再生成
 */

export type ToggleResult =
  | { success: true; is_published: boolean }
  | { success: false; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'DB_ERROR' }

export async function toggleCoursePublishedAction(
  courseId: string,
  nextValue: boolean,
): Promise<ToggleResult> {
  const guard = await requireAdmin()
  if (guard.ok === false) {
    return { success: false, code: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('e_learning_courses')
    .update({ is_published: nextValue })
    .eq('id', courseId)

  if (error) {
    console.error('[c005] toggleCoursePublishedAction failed', {
      code: error.code,
      courseId,
    })
    return { success: false, code: 'DB_ERROR' }
  }
  revalidatePath('/admin/e-learning/courses')
  return { success: true, is_published: nextValue }
}
