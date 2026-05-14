import { createClient } from '@/app/lib/supabase/server'
import { list as listBookmarks, type BookmarkRecord } from '@/app/lib/services/bookmark-service'

/**
 * B012 マイページ：ブックマーク取得（コース / 単体動画のタイトル付き整形）。
 *
 * 設計：
 * - bookmark-service.list(userId, 'all') を呼び、course_id / content_id を取得
 * - 関連 e_learning_courses / e_learning_contents の title を別クエリで取得して整形
 * - 公開状態（is_published）にかかわらず表示（自分のブックマーク履歴は購入と同じく「事実の保持」）
 */

export type BookmarkDetail = {
  id: string
  type: 'course' | 'content'
  target_id: string
  title: string | null
  course_slug: string | null
  thumbnail_url: string | null
  created_at: string
}

export async function getMyBookmarksDetail(userId: string): Promise<BookmarkDetail[]> {
  const records: BookmarkRecord[] = await listBookmarks(userId, 'all').catch(err => {
    console.error('[b012] listBookmarks failed', { message: err instanceof Error ? err.message : String(err) })
    return [] as BookmarkRecord[]
  })

  if (records.length === 0) return []

  const courseIds = records.map(r => r.course_id).filter((v): v is string => !!v)
  const contentIds = records.map(r => r.content_id).filter((v): v is string => !!v)

  const supabase = await createClient()

  const [coursesResp, contentsResp] = await Promise.all([
    courseIds.length > 0
      ? supabase
          .from('e_learning_courses')
          .select('id, title, slug, thumbnail_url')
          .in('id', courseIds)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string | null; slug: string | null; thumbnail_url: string | null }>, error: null }),
    contentIds.length > 0
      ? supabase
          .from('e_learning_contents')
          .select('id, title, thumbnail_url')
          .in('id', contentIds)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string | null; thumbnail_url: string | null }>, error: null }),
  ])

  if (coursesResp.error) console.error('[b012] courses fetch failed', { code: coursesResp.error.code })
  if (contentsResp.error) console.error('[b012] contents fetch failed', { code: contentsResp.error.code })

  const coursesMap = new Map(
    ((coursesResp.data ?? []) as Array<{ id: string; title: string | null; slug: string | null; thumbnail_url: string | null }>).map(c => [c.id, c]),
  )
  const contentsMap = new Map(
    ((contentsResp.data ?? []) as Array<{ id: string; title: string | null; thumbnail_url: string | null }>).map(c => [c.id, c]),
  )

  return records.map(r => {
    if (r.course_id) {
      const c = coursesMap.get(r.course_id)
      return {
        id: r.id,
        type: 'course' as const,
        target_id: r.course_id,
        title: c?.title ?? null,
        course_slug: c?.slug ?? null,
        thumbnail_url: c?.thumbnail_url ?? null,
        created_at: r.created_at,
      }
    }
    const c = r.content_id ? contentsMap.get(r.content_id) : undefined
    return {
      id: r.id,
      type: 'content' as const,
      target_id: r.content_id as string,
      title: c?.title ?? null,
      course_slug: null,
      thumbnail_url: c?.thumbnail_url ?? null,
      created_at: r.created_at,
    }
  })
}
