import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import {
  startCheckout,
  CheckoutError,
  type CheckoutTargetType,
} from '@/app/lib/services/checkout-service'

/**
 * POST /api/checkout
 *
 * 起点：docs/api/endpoints.md § POST /api/checkout
 *
 * リクエスト：
 *   { target_type: 'course' | 'content', target_id: string, cancel_return_url?: string }
 *
 * レスポンス（200）：
 *   { data: { checkout_url: string, stripe_session_id: string } }
 *
 * 既存の `POST /api/stripe/checkout`（全コンテンツ買い切り 4,980 円固定）は
 * 本番運用中のため touch しない。本エンドポイントは Phase 2 で導入した
 * コース／単体動画単位の購入用。
 */

const TARGET_TYPES: readonly CheckoutTargetType[] = ['course', 'content']

function isUuid(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  )
}

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status })
}

function checkoutErrorToStatus(code: CheckoutError['code']): number {
  switch (code) {
    case 'NOT_FOUND':
      return 404
    case 'BAD_REQUEST':
      return 400
    case 'ALREADY_PURCHASED':
    case 'ALREADY_FULL_ACCESS':
      return 409
    case 'STRIPE_API_ERROR':
      return 502
    case 'DB_ERROR':
    case 'INTERNAL_ERROR':
    default:
      return 500
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return errorResponse('UNAUTHORIZED', 'ログインが必要です', 401)
  }

  const body = await request.json().catch(() => ({}))
  const targetType = body?.target_type as unknown
  const targetId = body?.target_id as unknown
  const cancelReturnUrl =
    typeof body?.cancel_return_url === 'string' ? body.cancel_return_url : undefined

  if (
    typeof targetType !== 'string' ||
    !TARGET_TYPES.includes(targetType as CheckoutTargetType)
  ) {
    return errorResponse(
      'VALIDATION_ERROR',
      'target_type は "course" または "content" を指定してください',
      400,
    )
  }
  if (!isUuid(targetId)) {
    return errorResponse(
      'VALIDATION_ERROR',
      'target_id は UUID 形式で指定してください',
      400,
    )
  }

  // auth_user_id → e_learning_users.id の解決（access-service 等と同パターン）
  const { data: elearningUser, error: euError } = await supabase
    .from('e_learning_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (euError) {
    return errorResponse('DB_ERROR', 'ユーザー取得時の DB エラー', 500)
  }
  if (!elearningUser) {
    return errorResponse(
      'NOT_FOUND',
      'e-learning ユーザーが見つかりません',
      404,
    )
  }

  try {
    const result = await startCheckout({
      userId: elearningUser.id as string,
      targetType: targetType as CheckoutTargetType,
      targetId: targetId as string,
      cancelReturnUrl,
    })
    return NextResponse.json({
      data: {
        checkout_url: result.checkoutUrl,
        stripe_session_id: result.stripeSessionId,
      },
    })
  } catch (err) {
    if (err instanceof CheckoutError) {
      return errorResponse(err.code, err.message, checkoutErrorToStatus(err.code))
    }
    console.error('[POST /api/checkout] unexpected error', {
      message: err instanceof Error ? err.message : String(err),
    })
    return errorResponse(
      'INTERNAL_ERROR',
      '決済処理中にエラーが発生しました',
      500,
    )
  }
}
