import { createClient } from '@/app/lib/supabase/server'

/**
 * B011 マイページ：購入履歴の Server Component 用データ取得ヘルパ。
 *
 * 取得方針：
 * - 自分（user_id 一致）の e_learning_purchases のみ
 * - status='completed' を主表示・refunded は別配列として一緒に返す（FE 側で見せ方を切替可能）
 * - course / content の title / thumbnail を JOIN（公開状態は問わない＝過去購入は購入時の事実を維持）
 * - 個人別情報のため RLS 経由（access-service と同じ anon クライアントで動作）
 */

export type PurchaseRecord = {
  id: string
  course_id: string | null
  content_id: string | null
  stripe_session_id: string
  amount: number
  status: 'completed' | 'refunded'
  refunded_at: string | null
  created_at: string
  course_title: string | null
  course_slug: string | null
  content_title: string | null
}

export async function getMyPurchases(userId: string): Promise<{
  completed: PurchaseRecord[]
  refunded: PurchaseRecord[]
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('e_learning_purchases')
    .select(
      `id, course_id, content_id, stripe_session_id, amount, status, refunded_at, created_at,
       course:e_learning_courses ( title, slug ),
       content:e_learning_contents ( title )`,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[b011] getMyPurchases failed', { code: error.code, user_id: userId })
    return { completed: [], refunded: [] }
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string
    course_id: string | null
    content_id: string | null
    stripe_session_id: string
    amount: number
    status: string
    refunded_at: string | null
    created_at: string
    course: { title: string | null; slug: string | null } | { title: string | null; slug: string | null }[] | null
    content: { title: string | null } | { title: string | null }[] | null
  }>

  const completed: PurchaseRecord[] = []
  const refunded: PurchaseRecord[] = []

  for (const r of rows) {
    const courseRaw = Array.isArray(r.course) ? r.course[0] : r.course
    const contentRaw = Array.isArray(r.content) ? r.content[0] : r.content

    const record: PurchaseRecord = {
      id: r.id,
      course_id: r.course_id,
      content_id: r.content_id,
      stripe_session_id: r.stripe_session_id,
      amount: r.amount,
      status: r.status === 'refunded' ? 'refunded' : 'completed',
      refunded_at: r.refunded_at,
      created_at: r.created_at,
      course_title: courseRaw?.title ?? null,
      course_slug: courseRaw?.slug ?? null,
      content_title: contentRaw?.title ?? null,
    }

    if (record.status === 'refunded') refunded.push(record)
    else completed.push(record)
  }

  return { completed, refunded }
}
