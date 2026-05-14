import { createClient } from '@/app/lib/supabase/server'

/**
 * B014 マイページ：プロフィール表示用の Server Component データ取得ヘルパ。
 *
 * 設計：
 * - 自分の e_learning_users レコードを取得（auth_user_id 一致）
 * - 個人別情報のため RLS 経由・anon クライアント
 * - has_full_access / display_name / avatar_url / email / created_at を返す
 *   ※ email は user-service.withdraw でも L1 確定で保持される（マスキングしない）
 */

export type MyProfile = {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  has_full_access: boolean
  created_at: string
}

export async function getMyProfile(authUserId: string): Promise<MyProfile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('e_learning_users')
    .select('id, email, display_name, avatar_url, has_full_access, created_at')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (error) {
    console.error('[b014] getMyProfile failed', { code: error.code })
    return null
  }
  if (!data) return null

  return {
    id: data.id as string,
    email: (data.email as string | null) ?? null,
    display_name: (data.display_name as string | null) ?? null,
    avatar_url: (data.avatar_url as string | null) ?? null,
    has_full_access: !!data.has_full_access,
    created_at: data.created_at as string,
  }
}
