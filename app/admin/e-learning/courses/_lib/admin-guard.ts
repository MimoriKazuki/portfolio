import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { isAdminEmail } from '@/app/lib/auth/admin-guard'

/**
 * C005-C007 管理画面コース系の認証ガード（既存 admin-guard を活用する共通ヘルパ）。
 *
 * middleware で /admin 配下は認証ガード済だが、Server Component 側でも多層防御として
 * isAdminEmail を再チェックする（Phase 2 Sub 2a-3 で確立した方針）。
 */
export async function requireAdminForCourses(): Promise<{ email: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !user.email || !isAdminEmail(user.email)) {
    redirect('/auth/login?returnTo=/admin/e-learning/courses')
  }
  return { email: user.email }
}
