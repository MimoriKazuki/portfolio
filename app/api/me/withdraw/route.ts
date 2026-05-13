import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { withdraw } from '@/app/lib/services/user-service'

/**
 * POST /api/me/withdraw
 *
 * 退会 API（docs/auth/flow.md §G / docs/api/endpoints.md カテゴリ A）。
 *
 * フロー：
 * 1. auth.getUser で認証チェック（未ログインは 401）
 * 2. auth_user_id から e_learning_users.id を解決（存在しなければ 404）
 * 3. user-service.withdraw(euser.id) で論理削除＋ L1 マスキング
 * 4. supabase.auth.signOut() で Cookie をクリア（Controller 層の責務）
 * 5. 成功レスポンス { ok: true }
 *
 * middleware で /api/me/ は認証必須としてガード済み（多層防御）。
 */
export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // auth_user_id → e_learning_users.id
  const { data: euser, error: fetchError } = await supabase
    .from('e_learning_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (fetchError || !euser) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  try {
    await withdraw(euser.id)
  } catch (e) {
    // user-service 側で構造化ログ済み（PII 漏洩防止のためここでは詳細を再ログしない）
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  // Cookie クリア（services の責務ではなく Controller 層で実行）
  await supabase.auth.signOut()

  return NextResponse.json({ ok: true })
}
