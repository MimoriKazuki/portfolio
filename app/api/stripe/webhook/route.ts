import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/app/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Webhook用に独自のSupabaseクライアントを作成（Service Role Key使用）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // ユーザーのhas_paid_accessをtrueに更新
    const { error: updateError } = await supabaseAdmin
      .from('e_learning_users')
      .update({ has_paid_access: true })
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to update user paid access:', updateError)
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
      console.error('Failed to save purchase:', purchaseError)
      // 重複エラーの場合は無視（has_paid_accessの更新は成功しているので）
      if (!purchaseError.message.includes('duplicate')) {
        // ログのみ、エラーは返さない（has_paid_accessの更新が重要）
        console.warn('Purchase record insert failed, but access was granted')
      }
    }

    console.log(`E-Learning purchase completed: user=${userId}, session=${session.id}, amount=${amount}`)
  }

  return NextResponse.json({ received: true })
}

// Stripe webhookはbodyをそのまま読む必要があるためbodyParserを無効化
export const config = {
  api: {
    bodyParser: false,
  },
}
