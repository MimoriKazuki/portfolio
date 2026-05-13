import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

/**
 * /api/admin/* 用の認証チェック。
 * auth.users にレコードがある＝管理者（docs/auth/flow.md §D）。
 * 未ログインなら 401 を返す NextResponse、認証済なら null。
 *
 * 多層防御：middleware (`requiresAuth('/api/admin/')`) と併用。
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  return null
}
