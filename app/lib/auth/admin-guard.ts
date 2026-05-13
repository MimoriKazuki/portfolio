import { createClient } from '@/app/lib/supabase/server'

/**
 * 管理者判定：環境変数 ADMIN_EMAIL（カンマ区切り）に email が含まれるかを照合する。
 * Phase 1 の「auth.users 存在＝管理者」前提は本番で実害発生のため A 案（ADMIN_EMAIL ホワイトリスト）で置き換え。
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
  return adminEmails.includes(email)
}

export type AdminGuardOk = {
  ok: true
  user: { id: string; email: string }
}
export type AdminGuardErr = {
  ok: false
  status: 401 | 403
  error: 'unauthorized' | 'forbidden'
}
export type AdminGuardResult = AdminGuardOk | AdminGuardErr

/**
 * tsconfig.json の `strictNullChecks: false` 影響で `if (!guard.ok)` による discriminated union の
 * narrowing が効かないため、type predicate でユニオン分岐を強制する。
 */
export function isAdminGuardErr(r: AdminGuardResult): r is AdminGuardErr {
  return r.ok === false
}

/**
 * /admin / /api/admin/* 共通の管理者ガード。
 * - 未ログイン：401 unauthorized
 * - ログイン済かつ ADMIN_EMAIL 非該当：403 forbidden
 * - 管理者：ok=true で user を返す
 *
 * 多層防御：middleware で同等のチェックを行うが、API/Page 個別でも改めて検証する。
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const err: AdminGuardErr = { ok: false, status: 401, error: 'unauthorized' }
    return err
  }
  if (!isAdminEmail(user.email)) {
    const err: AdminGuardErr = { ok: false, status: 403, error: 'forbidden' }
    return err
  }
  const ok: AdminGuardOk = { ok: true, user: { id: user.id, email: user.email as string } }
  return ok
}
