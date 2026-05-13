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
 * 2. user-service.withdraw(user.id) で論理削除＋ L1 マスキング
 *    - user-service 側で auth_user_id → e_learning_users.id を service-role で解決
 *      （anon クライアント経由の SELECT を避けて RLS 依存を除去）
 *    - 内部不存在は `Error('user_not_found')` → 明示の 404 を返す
 * 3. supabase.auth.signOut() で Cookie をクリア（Controller 層の責務）
 * 4. 成功レスポンス { ok: true }
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

  try {
    await withdraw(user.id)
  } catch (e) {
    // user-service 側で構造化ログ済み（PII 漏洩防止のためここでは詳細を再ログしない）
    const message = e instanceof Error ? e.message : 'unknown'
    if (message === 'user_not_found') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  // Cookie クリア（services の責務ではなく Controller 層で実行）
  await supabase.auth.signOut()

  return NextResponse.json({ ok: true })
}
