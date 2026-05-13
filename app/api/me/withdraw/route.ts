import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { withdraw } from '@/app/lib/services/user-service'

/**
 * POST /api/me/withdraw
 *
 * 退会 API（docs/auth/flow.md §G / docs/api/endpoints.md カテゴリ A）。
 *
 * フロー：
 * 1. auth.getUser で認証チェック（未ログインは 401 UNAUTHORIZED）
 * 2. user-service.withdraw(user.id) で論理削除＋ L1 マスキング
 *    - user-service 側で auth_user_id → e_learning_users.id を service-role で解決
 *      （anon クライアント経由の SELECT を避けて RLS 依存を除去）
 *    - 内部不存在は `Error('user_not_found')` → 404 NOT_FOUND
 *    - その他 throw → 500 INTERNAL_ERROR
 * 3. supabase.auth.signOut() で Cookie をクリア（Controller 層の責務）
 *    - 失敗しても退会自体は成功しているため WARN ログのみ残して 200 を返す
 * 4. 成功レスポンス { ok: true }
 *
 * エラーレスポンス形式：docs/error-handling/errors.md に準拠
 *   { error: { code: 'XXX' } } 形式で SCREAMING_SNAKE_CASE
 *
 * middleware で /api/me/ は認証必須としてガード済み（多層防御）。
 */
export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  try {
    await withdraw(user.id)
  } catch (e) {
    // user-service 側で構造化ログ済み（PII 漏洩防止のためここでは詳細を再ログしない）
    const message = e instanceof Error ? e.message : 'unknown'
    if (message === 'user_not_found') {
      return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 })
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 })
  }

  // Cookie クリア（services の責務ではなく Controller 層で実行）
  // 失敗してもブラウザ上で「ログイン中」表示が残るのみで、退会自体は成功しているため 200 を返す。
  const { error: signOutError } = await supabase.auth.signOut()
  if (signOutError) {
    console.warn('[withdraw] signOut failed after successful withdraw', {
      auth_user_id: user.id,
      // signOutError.message は出さない（PII リスク回避）
    })
  }

  return NextResponse.json({ ok: true })
}
