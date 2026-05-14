import { createClient } from '@/app/lib/supabase/server'

/**
 * C010 管理画面：フルアクセスユーザー管理用の Server Component データ取得ヘルパ。
 *
 * 設計：
 * - e_learning_users のうち active（deleted_at IS NULL）のみ
 * - 検索：display_name / email を ILIKE
 * - has_full_access フィルタ：'all' | 'true' | 'false'
 */

export type AdminUsersFilters = {
  hasFullAccess?: 'all' | 'true' | 'false'
  keyword?: string
}

export type AdminUserRow = {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  has_full_access: boolean
  created_at: string
  updated_at: string
}

export async function getAdminUsers(
  filters: AdminUsersFilters = {},
): Promise<AdminUserRow[]> {
  const supabase = await createClient()

  let query = supabase
    .from('e_learning_users')
    .select('id, email, display_name, avatar_url, has_full_access, created_at, updated_at')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (filters.hasFullAccess === 'true') {
    query = query.eq('has_full_access', true)
  } else if (filters.hasFullAccess === 'false') {
    query = query.eq('has_full_access', false)
  }

  if (filters.keyword && filters.keyword.trim() !== '') {
    const kw = filters.keyword.trim().replace(/[%_]/g, '\\$&')
    query = query.or(`display_name.ilike.%${kw}%,email.ilike.%${kw}%`)
  }

  const { data, error } = await query
  if (error) {
    console.error('[c010] getAdminUsers failed', { code: error.code })
    return []
  }

  return ((data ?? []) as AdminUserRow[]).map(r => ({
    id: r.id,
    email: r.email,
    display_name: r.display_name,
    avatar_url: r.avatar_url,
    has_full_access: !!r.has_full_access,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }))
}
