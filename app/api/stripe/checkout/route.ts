import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/app/lib/stripe/client'
import { createClient } from '@/app/lib/supabase/server'

// 固定のStripe Price ID（eラーニング全コンテンツアクセス: 4,980円）
const E_LEARNING_PRICE_ID = process.env.STRIPE_E_LEARNING_PRICE_ID || 'price_1SaZq3Kvr8fxkHMdMUOjFG4W'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // リダイレクト先のコンテンツID（オプション）とキャンセル時の戻り先
    const body = await request.json().catch(() => ({}))
    const { contentId, cancelReturnUrl } = body

    // eラーニングユーザーを取得または作成
    let { data: elearningUser } = await supabase
      .from('e_learning_users')
      .select('id, has_paid_access')
      .eq('auth_user_id', user.id)
      .single()

    if (!elearningUser) {
      const { data: newUser, error: createError } = await supabase
        .from('e_learning_users')
        .insert({
          auth_user_id: user.id,
          email: user.email || '',
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || null,
        })
        .select('id, has_paid_access')
        .single()

      if (createError) {
        console.error('Failed to create e-learning user:', createError)
        return NextResponse.json(
          { error: 'ユーザー作成に失敗しました' },
          { status: 500 }
        )
      }
      elearningUser = newUser
    }

    // 既に購入済みかチェック（has_paid_accessで判定）
    if (elearningUser.has_paid_access) {
      return NextResponse.json(
        { error: '既に購入済みです' },
        { status: 400 }
      )
    }

    // Stripe Checkout Session作成
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.landbridge.ai'

    // リダイレクト先URL
    // 成功時: コンテンツIDがあればそのページ、なければトップページ
    // all-access（全コンテンツ購入）の場合はトップページ
    // キャンセル時: cancelReturnUrlがあればそこに戻る（バリデーション付き）
    const successPath = contentId && contentId !== 'all-access' ? `/e-learning/${contentId}` : '/e-learning'
    // cancelReturnUrlのバリデーション（サイト内パスのみ許可）
    // セキュリティ: /で始まり、://を含まない（外部URLを防ぐ）
    const isValidCancelUrl = cancelReturnUrl &&
      typeof cancelReturnUrl === 'string' &&
      cancelReturnUrl.startsWith('/') &&
      !cancelReturnUrl.includes('://')
    const cancelPath = isValidCancelUrl ? cancelReturnUrl : '/e-learning'

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: E_LEARNING_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}${successPath}?success=true`,
      cancel_url: `${baseUrl}${cancelPath}?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: elearningUser.id,
        authUserId: user.id,
      },
      locale: 'ja',
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: '決済処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
