import { getStripe } from '@/app/lib/stripe/client'

/**
 * B009 購入完了画面：Stripe Session から購入対象 metadata を取得するヘルパ。
 *
 * 設計：
 * - success_url に付与された session_id を受け取り Stripe API で取得
 * - metadata.user_id / target_type / target_id を返す（新形式 metadata 限定）
 * - 旧形式（userId のみ）や metadata 欠落は null 系の戻り値で「不明」として扱う
 * - 認証フローは Server Component 側で担保
 */

export type CheckoutSessionTarget =
  | { kind: 'course' | 'content'; targetId: string; userId: string }
  | { kind: 'unknown' }

export async function getCheckoutSessionTarget(
  sessionId: string,
): Promise<CheckoutSessionTarget> {
  const stripe = getStripe()
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const meta = session.metadata ?? {}
    const userId = typeof meta.user_id === 'string' ? meta.user_id : null
    const targetType = meta.target_type
    const targetId = typeof meta.target_id === 'string' ? meta.target_id : null

    if (
      userId &&
      (targetType === 'course' || targetType === 'content') &&
      targetId
    ) {
      return { kind: targetType, targetId, userId }
    }
    return { kind: 'unknown' }
  } catch (err) {
    console.error('[b009] Stripe Session retrieve failed', {
      message: err instanceof Error ? err.message : String(err),
      sessionId,
    })
    return { kind: 'unknown' }
  }
}
