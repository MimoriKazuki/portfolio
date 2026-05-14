import { redirect } from 'next/navigation'
import { Badge } from '@/app/components/atoms/Badge'
import { AdminPageHeader } from '@/app/components/organisms/AdminPageHeader'
import {
  AdminDataTable,
  type AdminDataTableColumn,
} from '@/app/components/organisms/AdminDataTable'
import { AdminListTemplate } from '@/app/components/templates/AdminListTemplate'
import { requireAdmin } from '@/app/lib/auth/admin-guard'
import { AdminPurchasesFilterClient } from './_lib/AdminPurchasesFilterClient'
import {
  getAdminPurchases,
  type AdminPurchaseRow,
  type AdminPurchasesFilters,
} from './_lib/get-admin-purchases'

/**
 * C009 管理画面：購入履歴（/admin/e-learning/purchases）
 *
 * 起点：
 * - docs/frontend/screens.md C009
 * - docs/frontend/page-templates.md §AdminListTemplate
 *
 * 設計：
 * - 管理者認証：middleware + requireAdmin 多層防御
 * - completed / refunded 全件を一覧表示・フィルタで絞り込み
 * - 旧 LP 経由（course_id=null AND content_id=null）の全コンテンツ買い切りも表示（legacy フィルタで分離可能）
 * - 編集不可（読み取り専用）・refunded 切替は Stripe Dashboard / charge.refunded Webhook 経由
 */

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseFilters(
  sp: Record<string, string | string[] | undefined>,
): AdminPurchasesFilters {
  const get = (key: string): string | undefined => {
    const v = sp[key]
    return Array.isArray(v) ? v[0] : v
  }

  const targetParam = get('target')
  const targetType: AdminPurchasesFilters['targetType'] =
    targetParam === 'course' || targetParam === 'content' || targetParam === 'legacy'
      ? targetParam
      : 'all'

  const statusParam = get('status')
  const status: AdminPurchasesFilters['status'] =
    statusParam === 'completed' || statusParam === 'refunded' ? statusParam : 'all'

  return {
    targetType,
    status,
    from: get('from'),
    to: get('to'),
    userKeyword: get('q'),
  }
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function PurchaseTargetCell({ row }: { row: AdminPurchaseRow }) {
  if (row.course_id) {
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="info">コース</Badge>
        <span className="truncate text-sm text-foreground">
          {row.course_title ?? '（タイトル不明）'}
        </span>
      </div>
    )
  }
  if (row.content_id) {
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="neutral">単体動画</Badge>
        <span className="truncate text-sm text-foreground">
          {row.content_title ?? '（タイトル不明）'}
        </span>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-1">
      <Badge variant="warning">旧 LP</Badge>
      <span className="truncate text-xs text-muted-foreground">
        全コンテンツ買い切り（後方互換）
      </span>
    </div>
  )
}

export default async function AdminELearningPurchasesPage({ searchParams }: PageProps) {
  const guard = await requireAdmin()
  if (guard.ok === false) {
    redirect(guard.status === 401 ? '/auth/login' : '/admin/e-learning')
  }

  const sp = await searchParams
  const filters = parseFilters(sp)
  const purchases = await getAdminPurchases(filters)

  const columns: AdminDataTableColumn<AdminPurchaseRow>[] = [
    {
      key: 'user',
      label: 'ユーザー',
      render: row => (
        <div className="flex flex-col gap-0.5">
          <span className="truncate text-sm text-foreground">
            {row.user_display_name ?? '（表示名未設定）'}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {row.user_email ?? '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'target',
      label: '購入対象',
      render: row => <PurchaseTargetCell row={row} />,
    },
    {
      key: 'amount',
      label: '金額',
      align: 'right',
      render: row => (
        <span className="text-sm text-foreground">¥{row.amount.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      label: 'ステータス',
      align: 'center',
      render: row =>
        row.status === 'refunded' ? (
          <Badge variant="danger">返金済</Badge>
        ) : (
          <Badge variant="success">完了</Badge>
        ),
    },
    {
      key: 'created_at',
      label: '購入日時',
      align: 'right',
      render: row => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(row.created_at)}
        </span>
      ),
    },
    {
      key: 'session',
      label: 'Stripe Session',
      align: 'right',
      render: row => (
        <span
          className="truncate text-xs text-muted-foreground"
          title={row.stripe_session_id}
        >
          {row.stripe_session_id.slice(0, 14)}…
        </span>
      ),
    },
  ]

  return (
    <AdminListTemplate
      header={
        <AdminPageHeader
          title="購入履歴"
          description="完了・返金済の購入を一覧表示します。ステータス変更は Stripe Dashboard 経由のみ（Webhook で自動反映）。"
        />
      }
      filterBar={<AdminPurchasesFilterClient />}
      table={
        <AdminDataTable columns={columns} data={purchases} isEmpty={purchases.length === 0} />
      }
    />
  )
}
