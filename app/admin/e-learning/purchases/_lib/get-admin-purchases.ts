import { createClient } from '@/app/lib/supabase/server'

/**
 * C009 購入履歴管理：Server Component 用データ取得ヘルパ。
 *
 * 設計：
 * - e_learning_purchases 全件（completed + refunded）を対象
 * - JOIN：e_learning_users（display_name/email）/ courses / contents（title）
 * - 期間フィルタ（created_at >= from / <= to）
 * - ユーザー検索（display_name / email ILIKE）→ user_id を逆引き
 * - target 種別フィルタ（'course' / 'content' / 'all'）
 * - ステータスフィルタ（'completed' / 'refunded' / 'all'）
 *
 * 注：旧 LP 経由の購入は metadata.userId のみで content_id=null の特殊レコードとして
 *     旧 Webhook 経由で INSERT されている（後方互換）。これは「全コンテンツ買い切り」として扱う。
 */

export type AdminPurchasesFilters = {
  targetType?: 'course' | 'content' | 'legacy' | 'all'
  status?: 'completed' | 'refunded' | 'all'
  from?: string
  to?: string
  /** ユーザー検索（display_name / email ILIKE）。 */
  userKeyword?: string
}

export type AdminPurchaseRow = {
  id: string
  user_id: string
  user_display_name: string | null
  user_email: string | null
  course_id: string | null
  course_title: string | null
  course_slug: string | null
  content_id: string | null
  content_title: string | null
  stripe_session_id: string
  stripe_payment_intent_id: string | null
  amount: number
  status: 'completed' | 'refunded'
  refunded_at: string | null
  created_at: string
}

export async function getAdminPurchases(
  filters: AdminPurchasesFilters = {},
): Promise<AdminPurchaseRow[]> {
  const supabase = await createClient()

  // ユーザー検索が指定されていれば user_id を逆引き
  let matchedUserIds: string[] | null = null
  if (filters.userKeyword && filters.userKeyword.trim() !== '') {
    const kw = filters.userKeyword.trim().replace(/[%_]/g, '\\$&')
    const { data: users } = await supabase
      .from('e_learning_users')
      .select('id')
      .or(`display_name.ilike.%${kw}%,email.ilike.%${kw}%`)
    matchedUserIds = ((users ?? []) as Array<{ id: string }>).map(u => u.id)
    if (matchedUserIds.length === 0) return [] // ヒットなし
  }

  let query = supabase
    .from('e_learning_purchases')
    .select(
      `id, user_id, course_id, content_id, stripe_session_id, stripe_payment_intent_id,
       amount, status, refunded_at, created_at,
       user:e_learning_users ( display_name, email ),
       course:e_learning_courses ( title, slug ),
       content:e_learning_contents ( title )`,
    )
    .order('created_at', { ascending: false })

  if (matchedUserIds) {
    query = query.in('user_id', matchedUserIds)
  }

  if (filters.status === 'completed' || filters.status === 'refunded') {
    query = query.eq('status', filters.status)
  }

  if (filters.targetType === 'course') {
    query = query.not('course_id', 'is', null)
  } else if (filters.targetType === 'content') {
    query = query.not('content_id', 'is', null)
  } else if (filters.targetType === 'legacy') {
    // 旧 LP 経由の全コンテンツ買い切り：course_id IS NULL かつ content_id IS NULL
    query = query.is('course_id', null).is('content_id', null)
  }

  if (filters.from) query = query.gte('created_at', filters.from)
  if (filters.to) query = query.lte('created_at', filters.to)

  const { data, error } = await query
  if (error) {
    console.error('[c009] getAdminPurchases failed', { code: error.code })
    return []
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string
    user_id: string
    course_id: string | null
    content_id: string | null
    stripe_session_id: string
    stripe_payment_intent_id: string | null
    amount: number
    status: string
    refunded_at: string | null
    created_at: string
    user: { display_name: string | null; email: string | null } | { display_name: string | null; email: string | null }[] | null
    course: { title: string | null; slug: string | null } | { title: string | null; slug: string | null }[] | null
    content: { title: string | null } | { title: string | null }[] | null
  }>

  return rows.map(r => {
    const u = Array.isArray(r.user) ? r.user[0] : r.user
    const c = Array.isArray(r.course) ? r.course[0] : r.course
    const co = Array.isArray(r.content) ? r.content[0] : r.content
    return {
      id: r.id,
      user_id: r.user_id,
      user_display_name: u?.display_name ?? null,
      user_email: u?.email ?? null,
      course_id: r.course_id,
      course_title: c?.title ?? null,
      course_slug: c?.slug ?? null,
      content_id: r.content_id,
      content_title: co?.title ?? null,
      stripe_session_id: r.stripe_session_id,
      stripe_payment_intent_id: r.stripe_payment_intent_id,
      amount: r.amount,
      status: r.status === 'refunded' ? 'refunded' : 'completed',
      refunded_at: r.refunded_at,
      created_at: r.created_at,
    }
  })
}
