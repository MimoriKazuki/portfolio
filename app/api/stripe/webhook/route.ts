import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/app/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Webhook用に独自のSupabaseクライアントを作成（Service Role Key使用）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Slack Webhook URL
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || ''

// Slack通知を送信する関数
async function sendSlackPurchaseNotification(
  userEmail: string,
  userName: string | null,
  amount: number,
  sessionId: string
) {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('SLACK_WEBHOOK_URL is not set, skipping notification')
    return
  }

  const slackMessage = {
    text: '新しいeラーニング購入がありました',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '💰 eラーニング購入完了',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*購入者:*\n${userName || '名前未設定'}`
          },
          {
            type: 'mrkdwn',
            text: `*メールアドレス:*\n${userEmail}`
          },
          {
            type: 'mrkdwn',
            text: `*購入金額:*\n¥${amount.toLocaleString()}`
          },
          {
            type: 'mrkdwn',
            text: `*商品:*\n全コンテンツアクセス`
          }
        ]
      },
      {
        type: 'divider'
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `購入日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} | Session: ${sessionId.slice(0, 20)}...`
          }
        ]
      }
    ]
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    })

    if (!response.ok) {
      console.error('Slack notification failed:', response.statusText)
    } else {
      console.log('Slack purchase notification sent successfully')
    }
  } catch (error) {
    console.error('Failed to send Slack notification:', error)
  }
}

// Slack通知：返金完了（既存購入通知と同パターン・PII 含む既存運用に合わせる）
async function sendSlackRefundNotification(
  stripeChargeId: string,
  paymentIntentId: string,
  amountRefunded: number,
) {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('SLACK_WEBHOOK_URL is not set, skipping refund notification')
    return
  }

  const slackMessage = {
    text: 'Stripe 返金処理が完了しました',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '💸 Stripe 返金完了',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*返金金額:*\n¥${amountRefunded.toLocaleString()}` },
          { type: 'mrkdwn', text: `*Charge ID:*\n${stripeChargeId}` },
          { type: 'mrkdwn', text: `*Payment Intent:*\n${paymentIntentId}` },
        ],
      },
      { type: 'divider' },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `処理日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
          },
        ],
      },
    ],
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    })
    if (!response.ok) {
      console.error('Slack refund notification failed:', response.statusText)
    }
  } catch (error) {
    console.error('Failed to send Slack refund notification:', error)
  }
}

// Slack通知：未対応の charge.refunded（順序逆転 / 未マッチ）
async function sendSlackRefundOrphanNotification(
  paymentIntentId: string,
  stripeChargeId: string,
) {
  if (!SLACK_WEBHOOK_URL) return
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `⚠️ charge.refunded が対応する purchase レコードと一致しませんでした (payment_intent=${paymentIntentId}, charge=${stripeChargeId})`,
      }),
    })
  } catch (error) {
    console.error('Failed to send Slack orphan refund notification:', error)
  }
}

// Slack通知：Webhook 処理失敗（errors.md rule G 準拠）
// event.id / event.type / errorMessage を必ず含めて Slack に通知。
async function sendSlackWebhookErrorNotification(input: {
  eventId: string
  eventType: string
  errorMessage: string
}) {
  if (!SLACK_WEBHOOK_URL) return
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `❌ Stripe Webhook 処理失敗`,
        blocks: [
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Event ID:*\n${input.eventId}` },
              { type: 'mrkdwn', text: `*Event Type:*\n${input.eventType}` },
              { type: 'mrkdwn', text: `*Error:*\n${input.errorMessage}` },
            ],
          },
        ],
      }),
    })
  } catch (error) {
    console.error('Failed to send Slack webhook error notification:', error)
  }
}

/**
 * charge.refunded ハンドラ
 *
 * 起点：docs/backend/logic/services/stripe-webhook-service.md §handleChargeRefunded
 *
 * 流れ：
 * 1. Charge object から payment_intent と created（Unix epoch 秒）を取得
 * 2. e_learning_purchases.stripe_payment_intent_id でマッチング（status='completed' 限定）
 * 3. status='refunded' + refunded_at = to_timestamp(charge.created) を同一 UPDATE 文でセット
 *    （CHECK 制約：(status='refunded' AND refunded_at IS NOT NULL) のため必須）
 * 4. 対象未存在：Slack 通知 + 200 OK（順序逆転対策・Stripe にリトライさせない）
 * 5. 既に refunded：noop + 200 OK（冪等・既存 refunded_at を保持）
 * 6. has_full_access は触らない（access-service が status='completed' のみ視聴可と判定）
 *
 * 返り値：
 *   - { ok: true }：成功または冪等（200 OK 返却）
 *   - { ok: false, errorMessage }：DB エラー（500 返却 + Slack 通知）
 */
type RefundHandleResult = { ok: true } | { ok: false; errorMessage: string }

async function handleChargeRefunded(charge: Stripe.Charge): Promise<RefundHandleResult> {
  const paymentIntentId =
    typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id

  if (!paymentIntentId) {
    console.error('[stripe-webhook] charge.refunded missing payment_intent', {
      chargeId: charge.id,
    })
    return { ok: true } // metadata 欠落系は 200 OK
  }

  // refunded_at = to_timestamp(charge.created)（Unix epoch 秒 → ISO 8601）
  const refundedAt = new Date(charge.created * 1000).toISOString()

  // 既存 purchase を取得（payment_intent_id でマッチ）
  const { data: existing, error: selectError } = await supabaseAdmin
    .from('e_learning_purchases')
    .select('id, status, refunded_at')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (selectError) {
    console.error('[stripe-webhook] charge.refunded select failed', {
      message: selectError.message,
      paymentIntentId,
    })
    return { ok: false, errorMessage: `select failed: ${selectError.message}` }
  }

  if (!existing) {
    // 順序逆転 or 対象外：Slack 通知 + 200 OK
    console.warn('[stripe-webhook] charge.refunded no matching purchase', {
      paymentIntentId,
      chargeId: charge.id,
    })
    await sendSlackRefundOrphanNotification(paymentIntentId, charge.id)
    return { ok: true }
  }

  if (existing.status === 'refunded') {
    // 冪等：既に refunded → 既存 refunded_at を保持・noop
    console.info('[stripe-webhook] charge.refunded already processed (idempotent)', {
      purchaseId: existing.id,
      paymentIntentId,
    })
    return { ok: true }
  }

  // status と refunded_at を同一 UPDATE 文でセット（CHECK 制約遵守）
  const { error: updateError } = await supabaseAdmin
    .from('e_learning_purchases')
    .update({
      status: 'refunded',
      refunded_at: refundedAt,
    })
    .eq('id', existing.id)

  if (updateError) {
    console.error('[stripe-webhook] charge.refunded update failed', {
      message: updateError.message,
      purchaseId: existing.id,
      paymentIntentId,
    })
    return { ok: false, errorMessage: `update failed: ${updateError.message}` }
  }

  console.info('[stripe-webhook] charge.refunded handled', {
    purchaseId: existing.id,
    paymentIntentId,
    chargeId: charge.id,
    refundedAt,
  })

  // Slack 通知（返金完了）
  await sendSlackRefundNotification(
    charge.id,
    paymentIntentId,
    charge.amount_refunded ?? 0,
  )

  return { ok: true }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    )
  }

  // checkout.session.completed イベントを処理
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // 新形式 metadata 判定（P3-WEBHOOK-NEW・2026-05-14）
    // 新導線 /api/checkout（checkout-service.ts）は metadata.user_id / target_type / target_id を必ずセットする。
    // 3 つすべてが揃っているなら新形式ロジック（e_learning_purchases に course_id or content_id を INSERT・
    // has_full_access は触らない）で処理する。
    //
    // 一方、旧導線 /api/stripe/checkout は metadata.userId（camelCase）のみ送る。
    // 旧形式は has_full_access 自動切替を温存（Kosuke 判断 2026-05-14・P3-CLEANUP-01 まで現状維持）。
    const newUserId = session.metadata?.user_id
    const newTargetType = session.metadata?.target_type
    const newTargetId = session.metadata?.target_id
    const isNewMetadata =
      typeof newUserId === 'string' &&
      newUserId.length > 0 &&
      (newTargetType === 'course' || newTargetType === 'content') &&
      typeof newTargetId === 'string' &&
      newTargetId.length > 0

    if (isNewMetadata) {
      // ---- 新形式（コース／単体動画ごとの購入） ----
      // stripe-webhook-service.md §handleCheckoutCompleted 準拠

      // payment_intent ID 取得（mode='payment' では string で返る・SDK v20 で確認済）
      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : (session.payment_intent?.id ?? null)

      const amount = session.amount_total ?? 0
      const insertRow = {
        user_id: newUserId,
        course_id: newTargetType === 'course' ? newTargetId : null,
        content_id: newTargetType === 'content' ? newTargetId : null,
        stripe_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        amount,
        status: 'completed' as const,
      }

      console.info('[stripe-webhook] checkout.session.completed (new metadata) received', {
        eventId: event.id,
        eventType: event.type,
        sessionId: session.id,
        target_type: newTargetType,
      })

      const { error: insertError } = await supabaseAdmin
        .from('e_learning_purchases')
        .insert(insertRow)

      if (insertError) {
        // UNIQUE 違反（既処理）→ 200 OK で冪等終了（stripe_session_id UNIQUE / 部分 UNIQUE のいずれか）
        const code = (insertError as { code?: string }).code
        const message = insertError.message ?? ''
        const isDuplicate = code === '23505' || message.toLowerCase().includes('duplicate')
        if (isDuplicate) {
          console.info('[stripe-webhook] checkout.session.completed already processed (idempotent)', {
            sessionId: session.id,
            target_id: newTargetId,
          })
        } else {
          // 非冪等エラー → 500 を返して Stripe 側にリトライさせる + errors.md rule G の Slack 通知
          console.error('[stripe-webhook] new-format purchase insert failed', {
            code,
            message,
            sessionId: session.id,
          })
          await sendSlackWebhookErrorNotification({
            eventId: event.id,
            eventType: event.type,
            errorMessage: `new-format insert failed: ${message}`,
          })
          return NextResponse.json(
            { error: 'Purchase insert failed' },
            { status: 500 },
          )
        }
      } else {
        console.info('[stripe-webhook] new-format purchase inserted', {
          sessionId: session.id,
          target_type: newTargetType,
          target_id: newTargetId,
          amount,
        })
      }

      // 新形式での Slack 通知は target タイトルを取得して整形（旧形式の「全コンテンツアクセス」固定から脱却）
      const { data: userData } = await supabaseAdmin
        .from('e_learning_users')
        .select('email, display_name')
        .eq('id', newUserId)
        .maybeSingle()

      if (userData) {
        await sendSlackPurchaseNotification(
          userData.email,
          userData.display_name,
          amount,
          session.id,
        )
      }
    } else {
      // ---- 旧形式（has_full_access 自動切替・後方互換） ----
      // 既存運用維持のため Kosuke 判断 2026-05-14 で温存
      // P3-CLEANUP-01（旧 /api/stripe/checkout 削除）と同時にこの分岐ごと削除予定
      const userId = session.metadata?.userId

      if (!userId) {
        console.error('Missing userId in session metadata:', session.id)
        return NextResponse.json(
          { error: 'Missing metadata' },
          { status: 400 }
        )
      }

      // 購入金額を取得
      const amount = session.amount_total || 0

      // ユーザーの has_full_access を true に更新（旧導線専用・新形式では絶対に触らない）
      const { error: updateError } = await supabaseAdmin
        .from('e_learning_users')
        .update({ has_full_access: true })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to update user full access:', updateError.message)
        return NextResponse.json(
          { error: 'Failed to update user access' },
          { status: 500 }
        )
      }

      // 購入履歴を保存（content_idはnull - 全コンテンツアクセス購入）
      const { error: purchaseError } = await supabaseAdmin
        .from('e_learning_purchases')
        .insert({
          user_id: userId,
          content_id: null,
          stripe_session_id: session.id,
          amount: amount,
          status: 'completed',
        })

      if (purchaseError) {
        console.error('Failed to save purchase:', purchaseError.message)
        // 重複エラーの場合は無視（has_full_access の更新は成功しているので）
        if (!purchaseError.message.includes('duplicate')) {
          // ログのみ、エラーは返さない（has_full_access の更新が重要）
          console.warn('Purchase record insert failed, but access was granted')
        }
      }

      // ユーザー情報を取得してSlack通知を送信
      const { data: userData } = await supabaseAdmin
        .from('e_learning_users')
        .select('email, display_name')
        .eq('id', userId)
        .single()

      if (userData) {
        await sendSlackPurchaseNotification(
          userData.email,
          userData.display_name,
          amount,
          session.id
        )
      }

      console.log(`E-Learning purchase completed: user=${userId}, session=${session.id}, amount=${amount}`)
    }
  }

  // charge.refunded イベントを処理（Phase 2 Sub 3b 追加）
  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    // stripe-webhook-service.md「全 event：event.id と event.type を必ずログ」準拠
    console.info('[stripe-webhook] charge.refunded received', {
      eventId: event.id,
      eventType: event.type,
      chargeId: charge.id,
    })
    const result = await handleChargeRefunded(charge)
    if (result.ok === false) {
      // errors.md rule G：失敗時は event.id / event.type / errorMessage を Slack 通知
      await sendSlackWebhookErrorNotification({
        eventId: event.id,
        eventType: event.type,
        errorMessage: result.errorMessage,
      })
      return NextResponse.json(
        { error: 'Refund processing failed' },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({ received: true })
}

// Stripe webhookはbodyをそのまま読む必要があるためbodyParserを無効化
export const config = {
  api: {
    bodyParser: false,
  },
}
