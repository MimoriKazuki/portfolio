import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/app/lib/supabase/server'

/**
 * bookmark-service：ブックマークの一覧／追加／削除。
 *
 * 起点：docs/backend/logic/services/auxiliary-services.md §bookmark-service
 *
 * 対象：
 * - コース（e_learning_courses）
 * - 単体動画（e_learning_contents）
 *
 * コース内動画（e_learning_course_videos）はブックマーク対象外（M4 確定）。
 *
 * クライアント方針：
 * - userId は **`e_learning_users.id`**（サロゲートPK）
 * - 呼び出し元（route / page）で auth_user_id → e_learning_users.id 解決を行う
 * - 内部は anon クライアント + RLS（自己レコードのみ操作可）で動作
 */

type AnySupabase = SupabaseClient<any, any, any>

export type BookmarkTargetType = 'course' | 'content'
export type BookmarkListType = BookmarkTargetType | 'all'

export interface BookmarkRecord {
  id: string
  user_id: string
  course_id: string | null
  content_id: string | null
  created_at: string
}

/** route 側で HTTP に変換する業務エラー */
export type BookmarkErrorCode =
  | 'NOT_FOUND' // 対象が未公開 / 存在しない / 他人の bookmark を削除しようとした
  | 'BAD_REQUEST' // targetType が 'course' / 'content' 以外
  | 'ALREADY_EXISTS' // 重複追加
  | 'DB_ERROR'

export class BookmarkError extends Error {
  constructor(public readonly code: BookmarkErrorCode, message: string) {
    super(message)
    this.name = 'BookmarkError'
  }
}

async function getClient(): Promise<AnySupabase> {
  return (await createClient()) as AnySupabase
}

/**
 * 対象（course / content）が公開中であることを確認。
 * is_published=false / deleted_at IS NOT NULL は NOT_FOUND。
 */
async function assertTargetPublished(
  supabase: AnySupabase,
  targetType: BookmarkTargetType,
  targetId: string,
): Promise<void> {
  const table = targetType === 'course' ? 'e_learning_courses' : 'e_learning_contents'
  const { data, error } = await supabase
    .from(table)
    .select('id, is_published, deleted_at')
    .eq('id', targetId)
    .maybeSingle()

  if (error) {
    throw new BookmarkError('DB_ERROR', '対象取得時の DB エラー')
  }
  if (!data || data.is_published === false || data.deleted_at !== null) {
    throw new BookmarkError('NOT_FOUND', '対象が見つかりません')
  }
}

/**
 * 自分のブックマーク一覧を取得。
 * type='all' なら course/content 混在を返す。
 */
export async function list(
  userId: string,
  type: BookmarkListType,
): Promise<BookmarkRecord[]> {
  if (type !== 'course' && type !== 'content' && type !== 'all') {
    throw new BookmarkError('BAD_REQUEST', 'type は course / content / all のいずれか')
  }

  const supabase = await getClient()

  let query = supabase
    .from('e_learning_bookmarks')
    .select('id, user_id, course_id, content_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (type === 'course') {
    query = query.not('course_id', 'is', null)
  } else if (type === 'content') {
    query = query.not('content_id', 'is', null)
  }

  const { data, error } = await query
  if (error) {
    console.error('[bookmark-service] list failed', { code: error.code, user_id: userId })
    throw new BookmarkError('DB_ERROR', 'ブックマーク取得に失敗しました')
  }
  return (data ?? []) as BookmarkRecord[]
}

/**
 * ブックマーク追加。
 *
 * 1. targetType バリデーション（course / content のみ）
 * 2. 対象が公開中か確認 → NOT_FOUND
 * 3. 既存ブックマーク重複チェック → ALREADY_EXISTS
 * 4. INSERT
 */
export async function add(
  userId: string,
  targetType: BookmarkTargetType,
  targetId: string,
): Promise<BookmarkRecord> {
  if (targetType !== 'course' && targetType !== 'content') {
    throw new BookmarkError('BAD_REQUEST', 'targetType は course / content のみ')
  }

  const supabase = await getClient()

  await assertTargetPublished(supabase, targetType, targetId)

  const column = targetType === 'course' ? 'course_id' : 'content_id'

  // 既存ブックマーク有無を確認（部分 UNIQUE と組み合わせて 409 を返すための事前チェック）
  const { data: existing, error: existsError } = await supabase
    .from('e_learning_bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq(column, targetId)
    .maybeSingle()

  if (existsError) {
    console.error('[bookmark-service] add exists check failed', {
      code: existsError.code,
      user_id: userId,
      target_type: targetType,
      target_id: targetId,
    })
    throw new BookmarkError('DB_ERROR', '既存確認に失敗しました')
  }
  if (existing) {
    throw new BookmarkError('ALREADY_EXISTS', '既にブックマーク済みです')
  }

  const insertRow = {
    user_id: userId,
    course_id: targetType === 'course' ? targetId : null,
    content_id: targetType === 'content' ? targetId : null,
  }

  const { data: inserted, error: insertError } = await supabase
    .from('e_learning_bookmarks')
    .insert(insertRow)
    .select('id, user_id, course_id, content_id, created_at')
    .single()

  if (insertError || !inserted) {
    // 並行 INSERT で UNIQUE 違反になる可能性 → ALREADY_EXISTS にマップ
    if (insertError?.code === '23505') {
      throw new BookmarkError('ALREADY_EXISTS', '既にブックマーク済みです')
    }
    console.error('[bookmark-service] add insert failed', {
      code: insertError?.code,
      user_id: userId,
      target_type: targetType,
      target_id: targetId,
    })
    throw new BookmarkError('DB_ERROR', 'ブックマーク追加に失敗しました')
  }

  return inserted as BookmarkRecord
}

/**
 * ブックマーク削除。
 *
 * 1. 取得して自分の bookmark か確認（他人なら 404 NOT_FOUND）
 * 2. DELETE
 */
export async function remove(userId: string, bookmarkId: string): Promise<void> {
  const supabase = await getClient()

  const { data: bookmark, error: selectError } = await supabase
    .from('e_learning_bookmarks')
    .select('id, user_id')
    .eq('id', bookmarkId)
    .maybeSingle()

  if (selectError) {
    console.error('[bookmark-service] remove select failed', {
      code: selectError.code,
      user_id: userId,
      bookmark_id: bookmarkId,
    })
    throw new BookmarkError('DB_ERROR', 'ブックマーク取得に失敗しました')
  }
  if (!bookmark || bookmark.user_id !== userId) {
    // 他人の bookmark / 存在しない → 同じ NOT_FOUND を返す（存在の有無の漏洩防止）
    throw new BookmarkError('NOT_FOUND', 'ブックマークが見つかりません')
  }

  const { error: deleteError } = await supabase
    .from('e_learning_bookmarks')
    .delete()
    .eq('id', bookmarkId)

  if (deleteError) {
    console.error('[bookmark-service] remove delete failed', {
      code: deleteError.code,
      user_id: userId,
      bookmark_id: bookmarkId,
    })
    throw new BookmarkError('DB_ERROR', 'ブックマーク削除に失敗しました')
  }
}
