import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { InfoPageTemplate } from '@/app/components/templates/InfoPageTemplate'
import { CheckoutPollingStatusClient } from './_lib/CheckoutPollingStatusClient'
import { getCheckoutSessionTarget } from './_lib/get-checkout-session'

/**
 * B009 購入完了画面（/e-learning/lp/checkout/complete?session_id=...）— Server Component
 *
 * 起点：
 * - docs/frontend/screens.md B009 + 「B009 購入完了画面の Webhook 反映待ち UI 仕様（補足）」
 * - docs/frontend/page-templates.md §InfoPageTemplate
 * - docs/backend/logic/services/access-service.md §購入完了直後の視聴権限確認フロー
 *
 * フロー：
 * 1. Stripe success_url の session_id を読み、Stripe API で metadata（user_id / target_type / target_id）を取得
 * 2. metadata が新形式（target_type ∈ {course, content}）なら、対応する詳細ページ URL を Client にわたす
 * 3. Client がポーリング（2 秒間隔・最大 10 回）で /api/me/access を呼び、target_id が含まれていれば視聴開始リンクを表示
 * 4. 不明 metadata（旧形式 or 欠落）→ マイページ購入履歴への案内のみ
 *
 * 個人別情報のため認証必須
 */

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ELearningLPCheckoutCompletePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const sessionIdParam = sp.session_id
  const sessionId =
    typeof sessionIdParam === 'string'
      ? sessionIdParam
      : Array.isArray(sessionIdParam)
        ? sessionIdParam[0]
        : undefined

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    const qs = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : ''
    redirect(`/auth/login?returnTo=/e-learning/lp/checkout/complete${qs}`)
  }

  // session_id が無い場合：マイページ案内のみ
  let target: Parameters<typeof CheckoutPollingStatusClient>[0]['target'] = {
    kind: 'unknown',
  }

  if (sessionId) {
    const stripeTarget = await getCheckoutSessionTarget(sessionId)
    if (stripeTarget.kind === 'course') {
      // course の場合は slug を解決して詳細リンクを組み立てる（id が metadata に入っているため、slug を引く）
      const { data: course } = await supabase
        .from('e_learning_courses')
        .select('slug')
        .eq('id', stripeTarget.targetId)
        .maybeSingle()
      const slug = course?.slug
      if (slug) {
        target = {
          kind: 'course',
          targetId: stripeTarget.targetId,
          courseDetailHref: `/e-learning/lp/courses/${slug}`,
        }
      }
    } else if (stripeTarget.kind === 'content') {
      target = {
        kind: 'content',
        targetId: stripeTarget.targetId,
        contentDetailHref: `/e-learning/${stripeTarget.targetId}`,
      }
    }
  }

  return (
    <InfoPageTemplate
      title="ご購入ありがとうございます"
      description={
        <p>
          決済が正常に完了しました。
          <br />
          視聴権限の反映を確認しています。
        </p>
      }
      primaryCta={<CheckoutPollingStatusClient target={target} />}
    />
  )
}
