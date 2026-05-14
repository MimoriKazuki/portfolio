import { redirect } from 'next/navigation'
import { AdminPageHeader } from '@/app/components/organisms/AdminPageHeader'
import { AdminListTemplate } from '@/app/components/templates/AdminListTemplate'
import { requireAdmin } from '@/app/lib/auth/admin-guard'
import { LegacyPurchasesTableClient } from './_lib/LegacyPurchasesTableClient'
import { getLegacyPurchases } from './_lib/get-legacy-purchases'

/**
 * C011 管理画面：レガシー購入レコード参照（/admin/e-learning/legacy-purchases）
 *
 * 起点：
 * - docs/frontend/screens.md C011（L3 確定・読み取り専用・税務目的）
 * - docs/backend/database/schema.dbml §9. e_learning_legacy_purchases
 * - WBS phase3.md「データ削除関連ルール」遵守（DELETE/UPDATE ボタン追加禁止）
 *
 * 設計：
 * - 読み取り専用一覧（編集・削除ボタンなし）
 * - 行クリックで詳細インライン展開（詳細画面遷移なし・screens.md 補足）
 * - 6 件の退避済レコード（Phase 2 で移行済）+ Stripe Session ID 等の税務確認情報
 */

export const dynamic = 'force-dynamic'

export default async function AdminELearningLegacyPurchasesPage() {
  const guard = await requireAdmin()
  if (guard.ok === false) {
    redirect(guard.status === 401 ? '/auth/login' : '/admin/e-learning')
  }

  const rows = await getLegacyPurchases()

  return (
    <AdminListTemplate
      header={
        <AdminPageHeader
          title="レガシー購入レコード"
          description="旧仕様で購入された 6 件の購入レコード（税務目的・読み取り専用）。編集・削除はできません。"
        />
      }
      table={<LegacyPurchasesTableClient rows={rows} />}
    />
  )
}
