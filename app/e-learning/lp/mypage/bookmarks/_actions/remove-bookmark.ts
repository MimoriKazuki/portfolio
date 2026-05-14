'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'
import { remove as removeBookmark, BookmarkError } from '@/app/lib/services/bookmark-service'

/**
 * B012 マイページ：ブックマーク解除 Server Action。
 *
 * 起点：docs/backend/logic/services/auxiliary-services.md §bookmark-service §remove
 *
 * フロー：
 * 1. Supabase Auth から auth.users.id を取得
 * 2. e_learning_users.id を解決
 * 3. bookmark-service.remove を呼ぶ（自分の bookmark か確認 → DELETE）
 * 4. revalidatePath で B012 ページを再生成
 */

export type RemoveBookmarkResult =
  | { success: true }
  | { success: false; code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'DB_ERROR' }

export async function removeBookmarkAction(
  bookmarkId: string,
): Promise<RemoveBookmarkResult> {
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
    await removeBookmark(eLearningUser.id, bookmarkId)
    revalidatePath('/e-learning/lp/mypage/bookmarks')
    return { success: true }
  } catch (err) {
    if (err instanceof BookmarkError) {
      if (err.code === 'NOT_FOUND') return { success: false, code: 'NOT_FOUND' }
      return { success: false, code: 'DB_ERROR' }
    }
    console.error('[b012] removeBookmarkAction unexpected error', {
      message: err instanceof Error ? err.message : String(err),
    })
    return { success: false, code: 'DB_ERROR' }
  }
}
