import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * F-06：/api/checkout route.ts の単体テスト
 *
 * カバレッジ：
 * - 認証チェック（401）
 * - 入力バリデーション（target_type / target_id・400）
 * - e_learning_users 解決の DB エラー（500）/ 未登録（404）
 * - checkout-service の業務エラー → HTTP ステータスへの変換
 * - Stripe Session URL 正常返却
 */

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/app/lib/services/checkout-service', async () => {
  const actual = await vi.importActual<typeof import('@/app/lib/services/checkout-service')>(
    '@/app/lib/services/checkout-service',
  )
  return {
    ...actual,
    startCheckout: vi.fn(),
  }
})

import { createClient } from '@/app/lib/supabase/server'
import { startCheckout, CheckoutError } from '@/app/lib/services/checkout-service'
import { POST } from '../route'

type SupabaseMock = {
  authError?: Error | null
  user?: { id: string } | null
  // e_learning_users 取得結果
  eLearningUser?: { id: string } | null
  euError?: { message: string } | null
}

function mockSupabaseClient(input: SupabaseMock) {
  const getUser = vi.fn().mockResolvedValue({
    data: { user: input.user ?? null },
    error: input.authError ?? null,
  })
  const maybeSingle = vi.fn().mockResolvedValue({
    data: input.eLearningUser ?? null,
    error: input.euError ?? null,
  })
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select }))
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: { getUser },
    from,
  })
  return { getUser, from }
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

const VALID_UUID = '11111111-2222-3333-4444-555555555555'

beforeEach(() => {
  vi.resetAllMocks()
})

describe('POST /api/checkout — 認証', () => {
  it('未認証（user=null）→ 401', async () => {
    mockSupabaseClient({ user: null })
    const res = await POST(
      makeRequest({ target_type: 'course', target_id: VALID_UUID }) as never,
    )
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      error: { code: 'UNAUTHORIZED', message: 'ログインが必要です' },
    })
    expect(startCheckout).not.toHaveBeenCalled()
  })

  it('auth.getUser がエラー → 401', async () => {
    mockSupabaseClient({ user: null, authError: new Error('auth failed') })
    const res = await POST(
      makeRequest({ target_type: 'course', target_id: VALID_UUID }) as never,
    )
    expect(res.status).toBe(401)
  })
})

describe('POST /api/checkout — バリデーション', () => {
  it('target_type が不正値 → 400 VALIDATION_ERROR', async () => {
    mockSupabaseClient({ user: { id: 'auth-1' } })
    const res = await POST(
      makeRequest({ target_type: 'invalid', target_id: VALID_UUID }) as never,
    )
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  it('target_type が欠落 → 400', async () => {
    mockSupabaseClient({ user: { id: 'auth-1' } })
    const res = await POST(makeRequest({ target_id: VALID_UUID }) as never)
    expect(res.status).toBe(400)
  })

  it('target_id が UUID 形式でない → 400 VALIDATION_ERROR', async () => {
    mockSupabaseClient({ user: { id: 'auth-1' } })
    const res = await POST(
      makeRequest({ target_type: 'content', target_id: 'not-a-uuid' }) as never,
    )
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  it('target_id が欠落 → 400', async () => {
    mockSupabaseClient({ user: { id: 'auth-1' } })
    const res = await POST(makeRequest({ target_type: 'course' }) as never)
    expect(res.status).toBe(400)
  })

  it('JSON パース失敗（空 body 経由）→ 400', async () => {
    mockSupabaseClient({ user: { id: 'auth-1' } })
    // body 文字列が JSON でなくても route 側で catch して {} に倒すため、結果的に target_type 検証で 400
    const req = new Request('http://localhost/api/checkout', {
      method: 'POST',
      body: 'not-json',
    })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
  })
})

describe('POST /api/checkout — e_learning_users 解決', () => {
  it('e_learning_users 取得時の DB エラー → 500 DB_ERROR', async () => {
    mockSupabaseClient({
      user: { id: 'auth-1' },
      euError: { message: 'db down' },
    })
    const res = await POST(
      makeRequest({ target_type: 'course', target_id: VALID_UUID }) as never,
    )
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('DB_ERROR')
    expect(startCheckout).not.toHaveBeenCalled()
  })

  it('e-learning ユーザー未登録 → 404 NOT_FOUND', async () => {
    mockSupabaseClient({ user: { id: 'auth-1' }, eLearningUser: null })
    const res = await POST(
      makeRequest({ target_type: 'course', target_id: VALID_UUID }) as never,
    )
    expect(res.status).toBe(404)
    expect((await res.json()).error.code).toBe('NOT_FOUND')
  })
})

describe('POST /api/checkout — checkout-service 連携', () => {
  it('正常系：Stripe Session URL を返す', async () => {
    mockSupabaseClient({
      user: { id: 'auth-1' },
      eLearningUser: { id: 'el-user-1' },
    })
    ;(startCheckout as ReturnType<typeof vi.fn>).mockResolvedValue({
      checkoutUrl: 'https://checkout.stripe.com/c/cs_test_abc',
      stripeSessionId: 'cs_test_abc',
    })

    const res = await POST(
      makeRequest({
        target_type: 'course',
        target_id: VALID_UUID,
        cancel_return_url: '/e-learning/lp/courses/sample',
      }) as never,
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      data: {
        checkout_url: 'https://checkout.stripe.com/c/cs_test_abc',
        stripe_session_id: 'cs_test_abc',
      },
    })
    expect(startCheckout).toHaveBeenCalledWith({
      userId: 'el-user-1',
      targetType: 'course',
      targetId: VALID_UUID,
      cancelReturnUrl: '/e-learning/lp/courses/sample',
    })
  })

  it('NOT_FOUND（target 未公開 / 論理削除済）→ 404', async () => {
    mockSupabaseClient({
      user: { id: 'auth-1' },
      eLearningUser: { id: 'el-user-1' },
    })
    ;(startCheckout as ReturnType<typeof vi.fn>).mockRejectedValue(
      new CheckoutError('NOT_FOUND', '対象が見つかりません'),
    )
    const res = await POST(
      makeRequest({ target_type: 'content', target_id: VALID_UUID }) as never,
    )
    expect(res.status).toBe(404)
    expect((await res.json()).error.code).toBe('NOT_FOUND')
  })

  it('BAD_REQUEST（無料商品の購入拒否）→ 400', async () => {
    mockSupabaseClient({
      user: { id: 'auth-1' },
      eLearningUser: { id: 'el-user-1' },
    })
    ;(startCheckout as ReturnType<typeof vi.fn>).mockRejectedValue(
      new CheckoutError('BAD_REQUEST', '無料商品は購入できません'),
    )
    const res = await POST(
      makeRequest({ target_type: 'content', target_id: VALID_UUID }) as never,
    )
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('BAD_REQUEST')
  })

  it('ALREADY_PURCHASED → 409', async () => {
    mockSupabaseClient({
      user: { id: 'auth-1' },
      eLearningUser: { id: 'el-user-1' },
    })
    ;(startCheckout as ReturnType<typeof vi.fn>).mockRejectedValue(
      new CheckoutError('ALREADY_PURCHASED', '既に購入済みです'),
    )
    const res = await POST(
      makeRequest({ target_type: 'course', target_id: VALID_UUID }) as never,
    )
    expect(res.status).toBe(409)
    expect((await res.json()).error.code).toBe('ALREADY_PURCHASED')
  })

  it('ALREADY_FULL_ACCESS → 409', async () => {
    mockSupabaseClient({
      user: { id: 'auth-1' },
      eLearningUser: { id: 'el-user-1' },
    })
    ;(startCheckout as ReturnType<typeof vi.fn>).mockRejectedValue(
      new CheckoutError(
        'ALREADY_FULL_ACCESS',
        '既に全コンテンツへのアクセス権があります',
      ),
    )
    const res = await POST(
      makeRequest({ target_type: 'course', target_id: VALID_UUID }) as never,
    )
    expect(res.status).toBe(409)
    expect((await res.json()).error.code).toBe('ALREADY_FULL_ACCESS')
  })

  it('INTERNAL_ERROR（stripe_price_id 未設定）→ 500', async () => {
    mockSupabaseClient({
      user: { id: 'auth-1' },
      eLearningUser: { id: 'el-user-1' },
    })
    ;(startCheckout as ReturnType<typeof vi.fn>).mockRejectedValue(
      new CheckoutError('INTERNAL_ERROR', '対象に Stripe Price ID が設定されていません'),
    )
    const res = await POST(
      makeRequest({ target_type: 'course', target_id: VALID_UUID }) as never,
    )
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('INTERNAL_ERROR')
  })

  it('DB_ERROR（service 内部）→ 500', async () => {
    mockSupabaseClient({
      user: { id: 'auth-1' },
      eLearningUser: { id: 'el-user-1' },
    })
    ;(startCheckout as ReturnType<typeof vi.fn>).mockRejectedValue(
      new CheckoutError('DB_ERROR', '購入履歴の取得に失敗しました'),
    )
    const res = await POST(
      makeRequest({ target_type: 'course', target_id: VALID_UUID }) as never,
    )
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('DB_ERROR')
  })

  it('STRIPE_API_ERROR → 502', async () => {
    mockSupabaseClient({
      user: { id: 'auth-1' },
      eLearningUser: { id: 'el-user-1' },
    })
    ;(startCheckout as ReturnType<typeof vi.fn>).mockRejectedValue(
      new CheckoutError('STRIPE_API_ERROR', 'Stripe API エラーが発生しました'),
    )
    const res = await POST(
      makeRequest({ target_type: 'course', target_id: VALID_UUID }) as never,
    )
    expect(res.status).toBe(502)
    expect((await res.json()).error.code).toBe('STRIPE_API_ERROR')
  })

  it('予期せぬ例外（CheckoutError 以外）→ 500 INTERNAL_ERROR', async () => {
    mockSupabaseClient({
      user: { id: 'auth-1' },
      eLearningUser: { id: 'el-user-1' },
    })
    ;(startCheckout as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('unexpected'),
    )
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await POST(
      makeRequest({ target_type: 'course', target_id: VALID_UUID }) as never,
    )
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('INTERNAL_ERROR')
    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})

describe('POST /api/checkout — cancel_return_url 受け渡し', () => {
  it('cancel_return_url 未指定（undefined） → checkout-service に undefined で渡す', async () => {
    mockSupabaseClient({
      user: { id: 'auth-1' },
      eLearningUser: { id: 'el-user-1' },
    })
    ;(startCheckout as ReturnType<typeof vi.fn>).mockResolvedValue({
      checkoutUrl: 'https://example.com/sess',
      stripeSessionId: 'cs_x',
    })
    await POST(
      makeRequest({ target_type: 'course', target_id: VALID_UUID }) as never,
    )
    expect(startCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ cancelReturnUrl: undefined }),
    )
  })

  it('cancel_return_url が文字列以外（数値）→ undefined として渡す', async () => {
    mockSupabaseClient({
      user: { id: 'auth-1' },
      eLearningUser: { id: 'el-user-1' },
    })
    ;(startCheckout as ReturnType<typeof vi.fn>).mockResolvedValue({
      checkoutUrl: 'https://example.com/sess',
      stripeSessionId: 'cs_x',
    })
    await POST(
      makeRequest({
        target_type: 'course',
        target_id: VALID_UUID,
        cancel_return_url: 123,
      }) as never,
    )
    expect(startCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ cancelReturnUrl: undefined }),
    )
  })

  // 注：オープンリダイレクト防止の最終判定は checkout-service.resolveCancelPath（既存テスト対象）
  // route 層は文字列の有無のみを渡し、検証は service 側に集約する設計のため
  // ここでは「文字列はそのまま渡す」「非文字列は undefined になる」までを検証
})
