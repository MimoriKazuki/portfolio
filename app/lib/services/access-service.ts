import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/app/lib/supabase/server'

/**
 * access-service：視聴・資料DL の権限判定を一手に担う。
 *
 * 起点：docs/backend/logic/services/access-service.md
 *
 * 視聴権限の優先順位（access-service.md §優先順位）：
 *   ① has_full_access=true        → 全動画視聴可
 *   ② コース購入済（status='completed' かつ course_id 一致） → そのコース内動画
 *   ③ 単体動画購入済                                          → その単体動画
 *   ④ is_free=true                                          → ログイン全員視聴可
 *   ⑤ それ以外                                              → 視聴不可
 *
 * - `status='refunded'` の購入は ②③ で false 扱い（返金＝権限剥奪と同義）
 * - 本サービスは has_full_access のみ参照。**新規コードから has_paid_access への参照は禁止**（M5 安全順序 Step3）
 *
 * クライアント方針：
 * - 引数 `userId` は **`e_learning_users.id`**（サロゲートPK）
 * - 呼び出し元（route / page）で auth_user_id → e_learning_users.id 解決を行う
 * - 内部は anon クライアント + RLS（自己レコードのみ SELECT 可）で動作。service-role 不要
 */

export type CourseVideoAccessReason =
  | 'full_access'
  | 'course_purchased'
  | 'free_course'
  | 'free_course_video'
  | 'not_purchased'

export type ContentAccessReason =
  | 'full_access'
  | 'content_purchased'
  | 'free_content'
  | 'not_purchased'

export type ViewerAccess = {
  hasFullAccess: boolean
  purchasedCourseIds: string[]
  purchasedContentIds: string[]
}

type AnySupabase = SupabaseClient<any, any, any>

async function getClient(): Promise<AnySupabase> {
  return (await createClient()) as AnySupabase
}

/**
 * 1 リクエスト内で複数の視聴可否を判定する際の集約取得。
 * @param userId e_learning_users.id（auth_user_id ではない）
 */
export async function getViewerAccess(userId: string): Promise<ViewerAccess> {
  const supabase = await getClient()

  const { data: user, error: userError } = await supabase
    .from('e_learning_users')
    .select('has_full_access')
    .eq('id', userId)
    .maybeSingle()

  if (userError) {
    console.error('[access-service] getViewerAccess fetch user failed', {
      code: userError.code,
      user_id: userId,
    })
  }
  const hasFullAccess = user?.has_full_access ?? false

  // 完了購入のみ取得（status='completed' で絞り込み・refunded は除外）
  const { data: purchases, error: purchasesError } = await supabase
    .from('e_learning_purchases')
    .select('course_id, content_id')
    .eq('user_id', userId)
    .eq('status', 'completed')

  if (purchasesError) {
    console.error('[access-service] getViewerAccess fetch purchases failed', {
      code: purchasesError.code,
      user_id: userId,
    })
  }

  const purchasedCourseIds: string[] = []
  const purchasedContentIds: string[] = []
  for (const row of purchases || []) {
    if (row.course_id) purchasedCourseIds.push(row.course_id as string)
    if (row.content_id) purchasedContentIds.push(row.content_id as string)
  }

  return { hasFullAccess, purchasedCourseIds, purchasedContentIds }
}

/**
 * コース内動画の視聴可否判定。
 * 順序：① has_full_access → ② コース購入済 → ③ コース全体 is_free → ④ 動画個別 is_free → ⑤ 不可
 */
export async function canViewCourseVideo(
  userId: string,
  courseVideoId: string
): Promise<{ canView: boolean; reason: CourseVideoAccessReason }> {
  const supabase = await getClient()

  // 動画 + 章 + コースの情報を1クエリで取得
  const { data: video, error: videoError } = await supabase
    .from('e_learning_course_videos')
    .select(`
      id,
      is_free,
      chapter:e_learning_course_chapters!inner (
        id,
        course_id,
        course:e_learning_courses!inner ( id, is_free )
      )
    `)
    .eq('id', courseVideoId)
    .maybeSingle()

  if (videoError || !video) {
    console.error('[access-service] canViewCourseVideo fetch video failed', {
      code: videoError?.code,
      course_video_id: courseVideoId,
    })
    return { canView: false, reason: 'not_purchased' }
  }

  const chapter = (video as any).chapter
  const course = chapter?.course
  const courseId: string | undefined = course?.id

  // ① has_full_access
  const { data: user } = await supabase
    .from('e_learning_users')
    .select('has_full_access')
    .eq('id', userId)
    .maybeSingle()

  if (user?.has_full_access) {
    return { canView: true, reason: 'full_access' }
  }

  // ② コース購入済（status='completed'）
  if (courseId) {
    const { data: purchase } = await supabase
      .from('e_learning_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('status', 'completed')
      .maybeSingle()

    if (purchase) {
      return { canView: true, reason: 'course_purchased' }
    }
  }

  // ③ コース全体 is_free
  if (course?.is_free) {
    return { canView: true, reason: 'free_course' }
  }

  // ④ 動画個別 is_free
  if (video.is_free) {
    return { canView: true, reason: 'free_course_video' }
  }

  // ⑤ 不可
  return { canView: false, reason: 'not_purchased' }
}

/**
 * 単体動画の視聴可否判定。
 * 順序：① has_full_access → ② 単体購入済 → ③ is_free → ④ 不可
 */
export async function canViewContent(
  userId: string,
  contentId: string
): Promise<{ canView: boolean; reason: ContentAccessReason }> {
  const supabase = await getClient()

  const { data: content, error: contentError } = await supabase
    .from('e_learning_contents')
    .select('id, is_free')
    .eq('id', contentId)
    .maybeSingle()

  if (contentError || !content) {
    console.error('[access-service] canViewContent fetch content failed', {
      code: contentError?.code,
      content_id: contentId,
    })
    return { canView: false, reason: 'not_purchased' }
  }

  // ① has_full_access
  const { data: user } = await supabase
    .from('e_learning_users')
    .select('has_full_access')
    .eq('id', userId)
    .maybeSingle()

  if (user?.has_full_access) {
    return { canView: true, reason: 'full_access' }
  }

  // ② 単体購入済（status='completed'）
  const { data: purchase } = await supabase
    .from('e_learning_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .eq('status', 'completed')
    .maybeSingle()

  if (purchase) {
    return { canView: true, reason: 'content_purchased' }
  }

  // ③ is_free
  if (content.is_free) {
    return { canView: true, reason: 'free_content' }
  }

  // ④ 不可
  return { canView: false, reason: 'not_purchased' }
}

/**
 * コース資料 DL の可否（視聴と同じ優先順位だが ④ is_free は資料 DL 対象外なので除外）。
 * 仕様メモ（access-service.md §優先順位）：DL 権限はコース全体に紐付くため、
 * ④ コース全体 is_free のみ許可（動画個別の is_free は DL に影響しない）。
 */
export async function canDownloadCourseMaterials(
  userId: string,
  courseId: string
): Promise<boolean> {
  const supabase = await getClient()

  // ① has_full_access
  const { data: user } = await supabase
    .from('e_learning_users')
    .select('has_full_access')
    .eq('id', userId)
    .maybeSingle()
  if (user?.has_full_access) return true

  // ② コース購入済
  const { data: purchase } = await supabase
    .from('e_learning_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('status', 'completed')
    .maybeSingle()
  if (purchase) return true

  // ③ コース全体 is_free
  const { data: course } = await supabase
    .from('e_learning_courses')
    .select('is_free')
    .eq('id', courseId)
    .maybeSingle()
  if (course?.is_free) return true

  return false
}

/**
 * 単体動画資料 DL の可否（視聴と同条件）。
 */
export async function canDownloadContentMaterials(
  userId: string,
  contentId: string
): Promise<boolean> {
  const { canView } = await canViewContent(userId, contentId)
  return canView
}
