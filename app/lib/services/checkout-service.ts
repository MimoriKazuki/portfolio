import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/app/lib/supabase/server'
import { getStripe } from '@/app/lib/stripe/client'

/**
 * checkout-service：Stripe Checkout Session 作成を担うサービス。
 *
 * 起点：docs/backend/logic/services/checkout-service.md
 *
 * 設計方針：
 * - 買い切り（one-time）モードで「コース」または「単体動画」を販売
 * - Stripe SDK を直接叩く唯一の出口（Webhook 側を除く）
 * - 購入可否のビジネスチェックを行ってから Stripe Session を作成
 * - DB 書き込みは行わない（書き込みは Webhook 側）
 *
 * 既存実装との差分：
 * - 既存：`STRIPE_E_LEARNING_PRICE_ID`（環境変数）の固定 Price ID で「全コンテンツ買い切り」専用
 *   既存実装は `app/api/stripe/checkout/route.ts`・本番運用中・touch しない
 * - 新規：DB の `e_learning_courses.stripe_price_id` / `e_learning_contents.stripe_price_id` を
 *   target ごとに動的取得し、コース／単体動画単位の販売をサポート
 *
 * 呼び出し元：
 * - `POST /api/checkout`（新規エンドポイント）
 *
 * クライアント方針：
 * - userId は **`e_learning_users.id`**（サロゲートPK）
 * - 呼び出し元（route）で auth_user_id → e_learning_users.id 解決を行う
 */

type AnySupabase = SupabaseClient<any, any, any>

export type CheckoutTargetType = 'course' | 'content'

export interface StartCheckoutInput {
  userId: string // e_learning_users.id
  targetType: CheckoutTargetType
  targetId: string
  cancelReturnUrl?: string
}

export interface StartCheckoutResult {
  checkoutUrl: string
  stripeSessionId: string
}

/**
 * checkout-service の業務エラー。
 * route 側で HTTP ステータスに変換する。
 */
export type CheckoutErrorCode =
  | 'NOT_FOUND'
  | 'BAD_REQUEST' // 無料商品の購入拒否
  | 'INTERNAL_ERROR' // stripe_price_id 未設定（設計エラー）
  | 'ALREADY_PURCHASED'
  | 'ALREADY_FULL_ACCESS'
  | 'STRIPE_API_ERROR'

export class CheckoutError extends Error {
  constructor(public readonly code: CheckoutErrorCode, message: string) {
    super(message)
    this.name = 'CheckoutError'
  }
}

async function getClient(): Promise<AnySupabase> {
  return (await createClient()) as AnySupabase
}

/**
 * target の公開状態と stripe_price_id を取得。
 * - is_published=false / deleted_at IS NOT NULL は NOT_FOUND
 * - is_free=true は BAD_REQUEST
 * - stripe_price_id NULL は INTERNAL_ERROR（設計エラー）
 */
async function getTargetPriceInfo(
  supabase: AnySupabase,
  targetType: CheckoutTargetType,
  targetId: string,
): Promise<{ stripePriceId: string }> {
  const table = targetType === 'course' ? 'e_learning_courses' : 'e_learning_contents'

  const { data: target, error } = await supabase
    .from(table)
    .select('id, is_published, deleted_at, is_free, stripe_price_id')
    .eq('id', targetId)
    .maybeSingle()

  if (error || !target) {
    throw new CheckoutError('NOT_FOUND', '対象が見つかりません')
  }

  if (target.is_published === false || target.deleted_at !== null) {
    throw new CheckoutError('NOT_FOUND', '対象が公開されていません')
  }

  if (target.is_free === true) {
    throw new CheckoutError('BAD_REQUEST', '無料商品は購入できません')
  }

  if (!target.stripe_price_id) {
    throw new CheckoutError(
      'INTERNAL_ERROR',
      '対象に Stripe Price ID が設定されていません',
    )
  }

  return { stripePriceId: target.stripe_price_id as string }
}

/**
 * ユーザーの has_full_access と既購入チェック用にユーザー情報を取得。
 */
async function getUserAccessInfo(
  supabase: AnySupabase,
  userId: string,
): Promise<{ hasFullAccess: boolean; email: string | null }> {
  const { data: user, error } = await supabase
    .from('e_learning_users')
    .select('id, has_full_access, email')
    .eq('id', userId)
    .maybeSingle()

  if (error || !user) {
    throw new CheckoutError('NOT_FOUND', 'ユーザーが見つかりません')
  }

  return {
    hasFullAccess: !!user.has_full_access,
    email: (user.email as string | null) ?? null,
  }
}

/**
 * 既購入チェック（完了状態の購入が存在するか）。
 * status='completed' のみ対象（'refunded' は権限剥奪・再購入可）。
 */
async function existsCompletedPurchase(
  supabase: AnySupabase,
  userId: string,
  targetType: CheckoutTargetType,
  targetId: string,
): Promise<boolean> {
  const column = targetType === 'course' ? 'course_id' : 'content_id'

  const { count, error } = await supabase
    .from('e_learning_purchases')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq(column, targetId)
    .eq('status', 'completed')

  if (error) {
    throw new CheckoutError(
      'INTERNAL_ERROR',
      '購入履歴の取得に失敗しました',
    )
  }

  return (count ?? 0) > 0
}

/**
 * cancel_return_url の検証。
 * - 文字列・/ 始まり・// 始まりでない・:// 含まない → そのまま使用
 *   - `//evil.com` 形式（プロトコル相対 URL）を防ぐため `//` 始まりを明示的に拒否
 *     （${baseUrl}${path} 連結でホストは変わらないが防御的に弾く）
 * - それ以外 → '/e-learning' フォールバック
 */
function resolveCancelPath(cancelReturnUrl: string | undefined): string {
  if (
    typeof cancelReturnUrl === 'string' &&
    cancelReturnUrl.startsWith('/') &&
    !cancelReturnUrl.startsWith('//') &&
    !cancelReturnUrl.includes('://')
  ) {
    return cancelReturnUrl
  }
  return '/e-learning'
}

/**
 * Stripe Checkout Session を作成して URL を返す。
 *
 * @throws CheckoutError 業務エラー（route 側で HTTP に変換）
 */
export async function startCheckout(
  input: StartCheckoutInput,
): Promise<StartCheckoutResult> {
  const supabase = await getClient()

  // 1. target 取得・公開／無料／price_id チェック
  const { stripePriceId } = await getTargetPriceInfo(
    supabase,
    input.targetType,
    input.targetId,
  )

  // 2. user 取得（has_full_access / email）
  const { hasFullAccess, email } = await getUserAccessInfo(supabase, input.userId)

  // 3. フルアクセスチェック（has_full_access 優先）
  if (hasFullAccess) {
    throw new CheckoutError(
      'ALREADY_FULL_ACCESS',
      '既に全コンテンツへのアクセス権があります',
    )
  }

  // 4. 既購入チェック
  const alreadyPurchased = await existsCompletedPurchase(
    supabase,
    input.userId,
    input.targetType,
    input.targetId,
  )
  if (alreadyPurchased) {
    throw new CheckoutError(
      'ALREADY_PURCHASED',
      '既に購入済みです',
    )
  }

  // 5. URL 決定
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.landbridge.ai'
  // success_url：B009「決済完了ページ」へ統一（Stripe プレースホルダで session.id 置換）
  const successUrl = `${baseUrl}/e-learning/checkout/complete?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${baseUrl}${resolveCancelPath(input.cancelReturnUrl)}?canceled=true`

  // 6. Stripe Session 作成
  const stripe = getStripe()
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(email ? { customer_email: email } : {}),
      metadata: {
        user_id: input.userId,
        target_type: input.targetType,
        target_id: input.targetId,
      },
      locale: 'ja',
    })

    if (!session.url) {
      throw new CheckoutError(
        'STRIPE_API_ERROR',
        'Stripe Session URL が返却されませんでした',
      )
    }

    return {
      checkoutUrl: session.url,
      stripeSessionId: session.id,
    }
  } catch (err) {
    if (err instanceof CheckoutError) throw err
    // Stripe SDK エラーは詳細をログ・ユーザーには汎用メッセージ
    console.error('[checkout-service] Stripe API error', err)
    throw new CheckoutError(
      'STRIPE_API_ERROR',
      'Stripe API エラーが発生しました',
    )
  }
}
