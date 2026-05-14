import { redirect } from 'next/navigation'
import { AdminPageHeader } from '@/app/components/organisms/AdminPageHeader'
import { AdminListTemplate } from '@/app/components/templates/AdminListTemplate'
import { requireAdmin } from '@/app/lib/auth/admin-guard'
import { AdminUsersFilterClient } from './_lib/AdminUsersFilterClient'
import { AdminUsersTableClient } from './_lib/AdminUsersTableClient'
import { getAdminUsers, type AdminUsersFilters } from './_lib/get-admin-users'

/**
 * C010 管理画面：フルアクセスユーザー管理（/admin/e-learning/users）
 *
 * 起点：
 * - docs/frontend/screens.md C010
 * - docs/backend/logic/services/access-service.md §NG（has_full_access は運営手動切替のみ）
 *
 * 設計：
 * - 管理者認証：middleware + requireAdmin 多層防御
 * - has_full_access の唯一の正規切替 UI（Webhook 自動切替なし）
 * - 切替時は確認 Dialog + 監査ログ console.info（admin email / target user / from→to）
 */

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseFilters(
  sp: Record<string, string | string[] | undefined>,
): AdminUsersFilters {
  const get = (key: string): string | undefined => {
    const v = sp[key]
    return Array.isArray(v) ? v[0] : v
  }
  const accessParam = get('access')
  const hasFullAccess: AdminUsersFilters['hasFullAccess'] =
    accessParam === 'true' || accessParam === 'false' ? accessParam : 'all'
  return { hasFullAccess, keyword: get('q') }
}

export default async function AdminELearningUsersPage({ searchParams }: PageProps) {
  const guard = await requireAdmin()
  if (guard.ok === false) {
    redirect(guard.status === 401 ? '/auth/login' : '/admin/e-learning')
  }

  const sp = await searchParams
  const filters = parseFilters(sp)
  const users = await getAdminUsers(filters)

  return (
    <AdminListTemplate
      header={
        <AdminPageHeader
          title="フルアクセスユーザー管理"
          description="ユーザーごとに has_full_access を手動切替できます。Webhook 自動切替は行われません（運営手動のみ）。"
        />
      }
      filterBar={<AdminUsersFilterClient />}
      table={<AdminUsersTableClient users={users} />}
    />
  )
}
