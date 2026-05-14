import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { createClient } from '@/app/lib/supabase/server'
import { Button } from '@/app/components/atoms/Button'
import { EmptyState } from '@/app/components/molecules/EmptyState'
import { MyPageTemplate } from '@/app/components/templates/MyPageTemplate'
import { getViewerAccess } from '@/app/lib/services/access-service'
import { MyPageSidebarClient } from '@/app/e-learning/lp/mypage/_lib/MyPageSidebarClient'
import { getMyPurchases, type PurchaseRecord } from './_lib/get-purchases'

/**
 * B011 マイページ：購入履歴（/e-learning/lp/mypage/purchases）— Server Component
 *
 * 起点：
 * - docs/frontend/screens.md B011 + 「B011 マイページ購入履歴の表示仕様（補足）」
 * - docs/frontend/page-templates.md §MyPageTemplate
 *
 * 設計：
 * - 自分の購入履歴を取得（status='completed' / 'refunded' を別配列で受け取り）
 * - has_full_access=true ユーザーには FullAccessBanner（screens.md 補足仕様）
 * - legacy_purchases は表示しない（管理画面 C011 のみ・税務目的）
 *
 * 個人別情報を扱うため認証必須・未ログインは A001 へリダイレクト
 */

export const dynamic = 'force-dynamic'

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return iso
  }
}

function PurchaseRow({ record }: { record: PurchaseRecord }) {
  const isCourse = !!record.course_id
  const title = isCourse ? record.course_title : record.content_title
  const link = isCourse
    ? record.course_slug
      ? `/e-learning/lp/courses/${record.course_slug}`
      : null
    : record.content_id
      ? `/e-learning/${record.content_id}`
      : null

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-sm text-foreground">
          {title ?? '（タイトル不明）'}
        </p>
        <p className="text-xs text-muted-foreground">
          {isCourse ? 'コース' : '単体動画'}・¥{record.amount.toLocaleString()}・
          {formatDate(record.created_at)}購入
          {record.status === 'refunded' && record.refunded_at && (
            <>　・{formatDate(record.refunded_at)}返金</>
          )}
        </p>
      </div>
      {link && (
        <Button asChild size="sm" variant="outline">
          <Link href={link}>視聴する</Link>
        </Button>
      )}
    </li>
  )
}

export default async function ELearningLPMyPurchasesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?returnTo=/e-learning/lp/mypage/purchases')
  }

  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  let purchases: { completed: PurchaseRecord[]; refunded: PurchaseRecord[] } = {
    completed: [],
    refunded: [],
  }
  let hasFullAccess = false
  if (eLearningUser) {
    const [p, access] = await Promise.all([
      getMyPurchases(eLearningUser.id),
      getViewerAccess(eLearningUser.id),
    ])
    purchases = p
    hasFullAccess = access.has_full_access
  }

  const hasAnyPurchase = purchases.completed.length > 0 || purchases.refunded.length > 0

  return (
    <MyPageTemplate
      header={
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-foreground md:text-3xl">購入履歴</h1>
          <p className="text-sm text-muted-foreground">
            これまでに購入したコース・単体動画を確認できます。
          </p>
        </header>
      }
      sidebar={<MyPageSidebarClient />}
    >
      <div className="flex flex-col gap-6">
        {hasFullAccess && (
          <aside
            role="status"
            className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-5 text-sm text-foreground"
          >
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <p className="text-foreground">全コンテンツ視聴権限を取得済みです</p>
              <p className="text-xs text-muted-foreground">
                旧プランで永続アクセス権が付与されています。最新コース・単体動画はホームからご覧ください。
              </p>
              <Link
                href="/e-learning/lp/courses"
                className="mt-1 text-xs text-primary hover:underline"
              >
                コース一覧へ
              </Link>
            </div>
          </aside>
        )}

        {!hasAnyPurchase && !hasFullAccess && (
          <EmptyState
            title="まだ購入はありません"
            description="コースや単体動画を購入すると、ここに履歴が表示されます。"
            action={
              <Button asChild>
                <Link href="/e-learning/lp/courses">コース一覧へ</Link>
              </Button>
            }
          />
        )}

        {purchases.completed.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg text-foreground">購入済み</h2>
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card text-card-foreground">
              {purchases.completed.map(record => (
                <PurchaseRow key={record.id} record={record} />
              ))}
            </ul>
          </section>
        )}

        {purchases.refunded.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg text-foreground">返金済み</h2>
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card text-card-foreground opacity-70">
              {purchases.refunded.map(record => (
                <PurchaseRow key={record.id} record={record} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </MyPageTemplate>
  )
}
