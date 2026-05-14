'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'
import { requireAdmin } from '@/app/lib/auth/admin-guard'

/**
 * C010 フルアクセスユーザー管理：has_full_access 手動切替 Server Action。
 *
 * 起点：
 * - docs/frontend/screens.md C010
 * - docs/backend/logic/services/access-service.md §NG（has_full_access は運営手動切替のみ）
 *
 * 設計：
 * - requireAdmin 多層防御
 * - 運営手動切替の正規 UI（Webhook で自動切替しない・新形式 metadata は has_full_access 触らない）
 * - 監査ログ：console.info で記録（運営者 email / 対象 user_id / 旧→新値）
 *   Phase 1 では DB 監査テーブルは未導入・ログ参照運用
 */

export type ToggleFullAccessResult =
  | { success: true; has_full_access: boolean }
  | { success: false; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'DB_ERROR' }

export async function toggleFullAccessAction(
  userId: string,
  nextValue: boolean,
): Promise<ToggleFullAccessResult> {
  const guard = await requireAdmin()
  if (guard.ok === false) {
    return { success: false, code: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN' }
  }

  const supabase = await createClient()

  // 旧値取得（監査ログ用）
  const { data: before } = await supabase
    .from('e_learning_users')
    .select('email, has_full_access')
    .eq('id', userId)
    .maybeSingle()

  if (!before) return { success: false, code: 'NOT_FOUND' }

  const { error } = await supabase
    .from('e_learning_users')
    .update({ has_full_access: nextValue })
    .eq('id', userId)

  if (error) {
    console.error('[c010] toggleFullAccessAction failed', {
      code: error.code,
      userId,
    })
    return { success: false, code: 'DB_ERROR' }
  }

  // 監査ログ（運営者 email / 対象 user 識別子 / 旧値 → 新値）
  console.info('[c010] has_full_access toggled by admin', {
    admin_email: guard.user.email,
    target_user_id: userId,
    target_user_email: before.email,
    from: !!before.has_full_access,
    to: nextValue,
  })

  revalidatePath('/admin/e-learning/users')
  return { success: true, has_full_access: nextValue }
}
