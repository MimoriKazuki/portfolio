import { createClient } from '@/app/lib/supabase/server'

/**
 * C011 レガシー購入レコード参照：Server Component 用データ取得ヘルパ。
 *
 * 起点：
 * - docs/frontend/screens.md C011（L3 確定・読み取り専用・税務目的）
 * - docs/backend/database/schema.dbml §9. e_learning_legacy_purchases
 *
 * 設計：
 * - 6 件の退避済レコードを取得（Phase 2 で移行済）
 * - JOIN：e_learning_users（display_name/email・退会済の表示は呼び出し側で考慮）
 * - 読み取り専用：INSERT/UPDATE/DELETE はこのページから一切行わない
 */

export type LegacyPurchaseRow = {
  id: string
  user_id: string
  user_display_name: string | null
  user_email: string | null
  content_id: string | null
  stripe_session_id: string | null
  amount: number
  status: string
  original_created_at: string
  migrated_at: string
  note: string | null
}

export async function getLegacyPurchases(): Promise<LegacyPurchaseRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('e_learning_legacy_purchases')
    .select(
      `id, user_id, content_id, stripe_session_id, amount, status, original_created_at, migrated_at, note,
       user:e_learning_users ( display_name, email )`,
    )
    .order('original_created_at', { ascending: false })

  if (error) {
    console.error('[c011] getLegacyPurchases failed', { code: error.code })
    return []
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string
    user_id: string
    content_id: string | null
    stripe_session_id: string | null
    amount: number
    status: string
    original_created_at: string
    migrated_at: string
    note: string | null
    user: { display_name: string | null; email: string | null } | { display_name: string | null; email: string | null }[] | null
  }>

  return rows.map(r => {
    const u = Array.isArray(r.user) ? r.user[0] : r.user
    return {
      id: r.id,
      user_id: r.user_id,
      user_display_name: u?.display_name ?? null,
      user_email: u?.email ?? null,
      content_id: r.content_id,
      stripe_session_id: r.stripe_session_id,
      amount: r.amount,
      status: r.status,
      original_created_at: r.original_created_at,
      migrated_at: r.migrated_at,
      note: r.note,
    }
  })
}
