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

/**
 * 視聴可否判定の理由区分（access-service.md §AccessReason 区分）。
 * 全メソッド共通の統合 union。各メソッドは部分集合のみを返す。
 */
export type AccessReason =
  | 'full_access'
  | 'course_purchased'
  | 'content_purchased'
  | 'free_course'
  | 'free_content'
  | 'free_course_video'
  | 'not_purchased'
  | 'unauthenticated'

/** canViewCourseVideo が返し得る reason の部分集合 */
export type CourseVideoAccessReason = Extract<
  AccessReason,
  'full_access' | 'course_purchased' | 'free_course' | 'free_course_video' | 'not_purchased'
>

/** canViewContent が返し得る reason の部分集合 */
export type ContentAccessReason = Extract<
  AccessReason,
  'full_access' | 'content_purchased' | 'free_content' | 'not_purchased'
>

/**
 * `/api/me/access` 用集約レスポンス。
 * snake_case はそのまま API JSON として返せるように合わせている（access-service.md §getViewerAccess）。
 */
export type ViewerAccess = {
  has_full_access: boolean
  purchased_course_ids: string[]
  purchased_content_ids: string[]
}

type AnySupabase = SupabaseClient<any, any, any>

async function getClient(): Promise<AnySupabase> {
  return (await createClient()) as AnySupabase
}

/** 内部ヘルパ：has_full_access を 1 クエリで取得（RLS 通過時のみ値が入る） */
async function fetchHasFullAccess(supabase: AnySupabase, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('e_learning_users')
    .select('has_full_access')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[access-service] fetchHasFullAccess failed', {
      code: error.code,
      user_id: userId,
    })
  }
  return data?.has_full_access ?? false
}

/** 内部ヘルパ：completed 購入の存在確認（refunded を除外する唯一のクエリ点） */
async function existsCompletedPurchase(
  supabase: AnySupabase,
  userId: string,
  target: { type: 'course'; courseId: string } | { type: 'content'; contentId: string }
): Promise<boolean> {
  const column = target.type === 'course' ? 'course_id' : 'content_id'
  const value = target.type === 'course' ? target.courseId : target.contentId

  const { data, error } = await supabase
    .from('e_learning_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq(column, value)
    .eq('status', 'completed')
    .maybeSingle()

  if (error) {
    console.error('[access-service] existsCompletedPurchase failed', {
      code: error.code,
      user_id: userId,
      target,
    })
    return false
  }
  return data !== null && data !== undefined
}

/**
 * 1 リクエスト内で複数の視聴可否を判定する際の集約取得。
 *
 * 戻り値は snake_case で `/api/me/access` レスポンスにそのまま流せる形にしてある。
 *
 * @param userId e_learning_users.id（auth_user_id ではない）
 */
export async function getViewerAccess(userId: string): Promise<ViewerAccess> {
  const supabase = await getClient()

  const has_full_access = await fetchHasFullAccess(supabase, userId)

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

  const purchased_course_ids: string[] = []
  const purchased_content_ids: string[] = []
  for (const row of purchases || []) {
    if (row.course_id) purchased_course_ids.push(row.course_id as string)
    if (row.content_id) purchased_content_ids.push(row.content_id as string)
  }

  return { has_full_access, purchased_course_ids, purchased_content_ids }
}

/**
 * コース内動画の視聴可否判定。
 *
 * 判定順序（access-service.md §canViewCourseVideo）：
 *   ① has_full_access → ② コース購入済 → ③ コース全体 is_free → ④ 動画個別 is_free → ⑤ 不可
 *
 * ※ コース内動画は単体購入の対象外（コース単位購入のみ）。共通 §優先順位の ③ 単体購入済 は適用しない。
 */
export async function canViewCourseVideo(
  userId: string,
  courseVideoId: string
): Promise<{ allowed: boolean; reason: CourseVideoAccessReason }> {
  const supabase = await getClient()

  // 動画 + 章 + コースの情報を1クエリで取得（チェーン JOIN で課金関連 3 テーブルを 1 往復に圧縮）
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
    return { allowed: false, reason: 'not_purchased' }
  }

  const chapter = (video as any).chapter
  const course = chapter?.course
  const courseId: string | undefined = course?.id

  // ① has_full_access
  if (await fetchHasFullAccess(supabase, userId)) {
    return { allowed: true, reason: 'full_access' }
  }

  // ② コース購入済（status='completed' のみ・refunded は除外）
  if (courseId && (await existsCompletedPurchase(supabase, userId, { type: 'course', courseId }))) {
    return { allowed: true, reason: 'course_purchased' }
  }

  // ③ コース全体 is_free
  if (course?.is_free) {
    return { allowed: true, reason: 'free_course' }
  }

  // ④ 動画個別 is_free
  if (video.is_free) {
    return { allowed: true, reason: 'free_course_video' }
  }

  // ⑤ 不可
  return { allowed: false, reason: 'not_purchased' }
}

/**
 * 単体動画の視聴可否判定。
 *
 * 判定順序（access-service.md §canViewContent）：
 *   ① has_full_access → ② 単体購入済 → ③ is_free → ④ 不可
 */
export async function canViewContent(
  userId: string,
  contentId: string
): Promise<{ allowed: boolean; reason: ContentAccessReason }> {
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
    return { allowed: false, reason: 'not_purchased' }
  }

  // ① has_full_access
  if (await fetchHasFullAccess(supabase, userId)) {
    return { allowed: true, reason: 'full_access' }
  }

  // ② 単体購入済（status='completed' のみ）
  if (await existsCompletedPurchase(supabase, userId, { type: 'content', contentId })) {
    return { allowed: true, reason: 'content_purchased' }
  }

  // ③ is_free
  if (content.is_free) {
    return { allowed: true, reason: 'free_content' }
  }

  // ④ 不可
  return { allowed: false, reason: 'not_purchased' }
}

/**
 * コース資料 DL の可否判定。
 *
 * 判定順序（access-service.md §優先順位の DL 用変形）：
 *   ① has_full_access → ② コース購入済 → ③ コース全体 is_free → ④ 不可
 *
 * ※ 動画個別の is_free は DL 権限に影響しない（DL 権限はコース全体に紐付くため）。
 */
export async function canDownloadCourseMaterials(
  userId: string,
  courseId: string
): Promise<boolean> {
  const supabase = await getClient()

  if (await fetchHasFullAccess(supabase, userId)) return true

  if (await existsCompletedPurchase(supabase, userId, { type: 'course', courseId })) return true

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
  const { allowed } = await canViewContent(userId, contentId)
  return allowed
}
