import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/app/lib/stripe/client', () => ({
  getStripe: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { getStripe } from '@/app/lib/stripe/client'
import { startCheckout, CheckoutError } from '../checkout-service'

// ----------------------------------------------------------------
// チェーンスタブ ビルダー
// ----------------------------------------------------------------

// .select().eq().maybeSingle() → { data, error }
function makeTargetChain(data: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error })
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  return { select }
}

// e_learning_users .select().eq().maybeSingle()
function makeUserChain(data: unknown, error: unknown = null) {
  return makeTargetChain(data, error)
}

// existsCompletedPurchase: .select('id', {count}).eq().eq().eq() → { count, error }
function makePurchaseCountChain(count: number, error: unknown = null) {
  const eq3 = vi.fn().mockResolvedValue({ count, error })
  const eq2 = vi.fn(() => ({ eq: eq3 }))
  const eq1 = vi.fn(() => ({ eq: eq2 }))
  const select = vi.fn(() => ({ eq: eq1 }))
  return { select }
}

type TableStub = { select: ReturnType<typeof vi.fn> }

function mockClient(tables: Record<string, TableStub | TableStub[]>) {
  const callCounts: Record<string, number> = {}
  const from = vi.fn((name: string) => {
    const entry = tables[name]
    if (!entry) return {}
    if (Array.isArray(entry)) {
      const idx = callCounts[name] ?? 0
      callCounts[name] = idx + 1
      return entry[idx] ?? entry[entry.length - 1]
    }
    return entry
  })
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { from }
}

function mockStripe(sessionOverride: Partial<{ url: string; id: string }> = {}, shouldThrow = false) {
  const session = { url: 'https://checkout.stripe.com/test', id: 'cs_test_123', ...sessionOverride }
  const create = shouldThrow
    ? vi.fn().mockRejectedValue(new Error('Stripe network error'))
    : vi.fn().mockResolvedValue(session)
  ;(getStripe as ReturnType<typeof vi.fn>).mockReturnValue({
    checkout: { sessions: { create } },
  })
  return { create }
}

// 正常系で使う共通スタブ
const publishedCourse = {
  id: 'course-1',
  is_published: true,
  deleted_at: null,
  is_free: false,
  stripe_price_id: 'price_course_123',
}
const publishedContent = {
  id: 'content-1',
  is_published: true,
  deleted_at: null,
  is_free: false,
  stripe_price_id: 'price_content_456',
}
const normalUser = { id: 'eu-1', has_full_access: false, email: 'user@example.com' }

const BASE_INPUT = {
  userId: 'eu-1',
  targetType: 'course' as const,
  targetId: 'course-1',
}

beforeEach(() => {
  vi.resetAllMocks()
  process.env.NEXT_PUBLIC_BASE_URL = 'https://www.landbridge.ai'
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy'
})

afterEach(() => {
  delete process.env.NEXT_PUBLIC_BASE_URL
  delete process.env.STRIPE_SECRET_KEY
})

// ----------------------------------------------------------------
// 正常系
// ----------------------------------------------------------------
describe('startCheckout — 正常系', () => {
  it('course の正常購入フロー → checkoutUrl / stripeSessionId 返却', async () => {
    mockClient({
      e_learning_courses: makeTargetChain(publishedCourse),
      e_learning_users: makeUserChain(normalUser),
      e_learning_purchases: makePurchaseCountChain(0),
    })
    const { create } = mockStripe()

    const result = await startCheckout(BASE_INPUT)
    expect(result.checkoutUrl).toBe('https://checkout.stripe.com/test')
    expect(result.stripeSessionId).toBe('cs_test_123')
    expect(create).toHaveBeenCalledOnce()
  })

  it('content の正常購入フロー → checkoutUrl / stripeSessionId 返却', async () => {
    mockClient({
      e_learning_contents: makeTargetChain(publishedContent),
      e_learning_users: makeUserChain(normalUser),
      e_learning_purchases: makePurchaseCountChain(0),
    })
    mockStripe()

    const result = await startCheckout({ ...BASE_INPUT, targetType: 'content', targetId: 'content-1' })
    expect(result.checkoutUrl).toBeTruthy()
    expect(result.stripeSessionId).toBeTruthy()
  })

  it('cancelReturnUrl 正常値 → cancel_url に含まれる', async () => {
    mockClient({
      e_learning_courses: makeTargetChain(publishedCourse),
      e_learning_users: makeUserChain(normalUser),
      e_learning_purchases: makePurchaseCountChain(0),
    })
    const { create } = mockStripe()

    await startCheckout({ ...BASE_INPUT, cancelReturnUrl: '/e-learning/courses/some-slug' })
    const callArg = create.mock.calls[0][0]
    expect(callArg.cancel_url).toContain('/e-learning/courses/some-slug')
  })

  it('cancelReturnUrl 省略 → cancel_url が /e-learning フォールバック', async () => {
    mockClient({
      e_learning_courses: makeTargetChain(publishedCourse),
      e_learning_users: makeUserChain(normalUser),
      e_learning_purchases: makePurchaseCountChain(0),
    })
    const { create } = mockStripe()

    await startCheckout(BASE_INPUT)
    const callArg = create.mock.calls[0][0]
    expect(callArg.cancel_url).toContain('/e-learning')
    expect(callArg.cancel_url).not.toContain('/e-learning/courses')
  })
})

// ----------------------------------------------------------------
// バリデーション系（CheckoutError）
// ----------------------------------------------------------------
describe('startCheckout — バリデーション系', () => {
  it('NOT_FOUND：target が存在しない（maybeSingle=null）', async () => {
    mockClient({ e_learning_courses: makeTargetChain(null) })

    await expect(startCheckout(BASE_INPUT)).rejects.toThrow(CheckoutError)
    await expect(startCheckout(BASE_INPUT)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('NOT_FOUND：target.is_published=false', async () => {
    mockClient({ e_learning_courses: makeTargetChain({ ...publishedCourse, is_published: false }) })

    await expect(startCheckout(BASE_INPUT)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('NOT_FOUND：target.deleted_at IS NOT NULL', async () => {
    mockClient({ e_learning_courses: makeTargetChain({ ...publishedCourse, deleted_at: '2024-01-01T00:00:00Z' }) })

    await expect(startCheckout(BASE_INPUT)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('BAD_REQUEST：target.is_free=true', async () => {
    mockClient({ e_learning_courses: makeTargetChain({ ...publishedCourse, is_free: true }) })

    await expect(startCheckout(BASE_INPUT)).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  it('INTERNAL_ERROR：target.stripe_price_id IS NULL', async () => {
    mockClient({ e_learning_courses: makeTargetChain({ ...publishedCourse, stripe_price_id: null }) })

    await expect(startCheckout(BASE_INPUT)).rejects.toMatchObject({ code: 'INTERNAL_ERROR' })
  })

  it('NOT_FOUND：user が存在しない', async () => {
    mockClient({
      e_learning_courses: makeTargetChain(publishedCourse),
      e_learning_users: makeUserChain(null),
    })

    await expect(startCheckout(BASE_INPUT)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('ALREADY_FULL_ACCESS：user.has_full_access=true', async () => {
    mockClient({
      e_learning_courses: makeTargetChain(publishedCourse),
      e_learning_users: makeUserChain({ ...normalUser, has_full_access: true }),
    })

    await expect(startCheckout(BASE_INPUT)).rejects.toMatchObject({ code: 'ALREADY_FULL_ACCESS' })
  })

  it('ALREADY_PURCHASED：completed の購入が既に存在', async () => {
    mockClient({
      e_learning_courses: makeTargetChain(publishedCourse),
      e_learning_users: makeUserChain(normalUser),
      e_learning_purchases: makePurchaseCountChain(1),
    })

    await expect(startCheckout(BASE_INPUT)).rejects.toMatchObject({ code: 'ALREADY_PURCHASED' })
  })
})

// ----------------------------------------------------------------
// セキュリティ系（cancel_return_url）
// ----------------------------------------------------------------
describe('startCheckout — cancelReturnUrl セキュリティ', () => {
  async function getCancelUrl(cancelReturnUrl: string) {
    mockClient({
      e_learning_courses: makeTargetChain(publishedCourse),
      e_learning_users: makeUserChain(normalUser),
      e_learning_purchases: makePurchaseCountChain(0),
    })
    const { create } = mockStripe()
    await startCheckout({ ...BASE_INPUT, cancelReturnUrl })
    return create.mock.calls[0][0].cancel_url as string
  }

  it('外部 URL（https://evil.com/x）→ /e-learning フォールバック', async () => {
    const url = await getCancelUrl('https://evil.com/x')
    expect(url).toContain('/e-learning')
    expect(url).not.toContain('evil.com')
  })

  it('/ 始まりでない値（foo bar）→ /e-learning フォールバック', async () => {
    const url = await getCancelUrl('foo bar')
    expect(url).toContain('/e-learning')
    expect(url).not.toContain('foo')
  })

  it(':// 含む値（/x://y）→ /e-learning フォールバック', async () => {
    const url = await getCancelUrl('/x://y')
    expect(url).toContain('/e-learning')
    expect(url).not.toContain('x://')
  })
})

// ----------------------------------------------------------------
// Stripe API エラー系
// ----------------------------------------------------------------
describe('startCheckout — Stripe API エラー', () => {
  it('stripe.checkout.sessions.create が throw → CheckoutError(STRIPE_API_ERROR)', async () => {
    mockClient({
      e_learning_courses: makeTargetChain(publishedCourse),
      e_learning_users: makeUserChain(normalUser),
      e_learning_purchases: makePurchaseCountChain(0),
    })
    mockStripe({}, true) // shouldThrow=true

    await expect(startCheckout(BASE_INPUT)).rejects.toMatchObject({ code: 'STRIPE_API_ERROR' })
  })

  it('session.url が null → CheckoutError(STRIPE_API_ERROR)', async () => {
    mockClient({
      e_learning_courses: makeTargetChain(publishedCourse),
      e_learning_users: makeUserChain(normalUser),
      e_learning_purchases: makePurchaseCountChain(0),
    })
    mockStripe({ url: null as unknown as string })

    await expect(startCheckout(BASE_INPUT)).rejects.toMatchObject({ code: 'STRIPE_API_ERROR' })
  })
})

// ----------------------------------------------------------------
// Stripe API 引数検証
// ----------------------------------------------------------------
describe('startCheckout — Stripe API 呼び出し引数の確認', () => {
  it('mode / line_items / metadata / success_url / customer_email が正しく渡される', async () => {
    mockClient({
      e_learning_courses: makeTargetChain(publishedCourse),
      e_learning_users: makeUserChain(normalUser),
      e_learning_purchases: makePurchaseCountChain(0),
    })
    const { create } = mockStripe()

    await startCheckout(BASE_INPUT)
    const arg = create.mock.calls[0][0]

    expect(arg.mode).toBe('payment')
    expect(arg.line_items[0].price).toBe(publishedCourse.stripe_price_id)
    expect(arg.metadata).toEqual({
      user_id: BASE_INPUT.userId,
      target_type: BASE_INPUT.targetType,
      target_id: BASE_INPUT.targetId,
    })
    expect(arg.success_url).toContain('/e-learning/checkout/complete')
    expect(arg.success_url).toContain('{CHECKOUT_SESSION_ID}')
    expect(arg.customer_email).toBe(normalUser.email)
  })

  it('email が null の場合 customer_email が渡されない', async () => {
    mockClient({
      e_learning_courses: makeTargetChain(publishedCourse),
      e_learning_users: makeUserChain({ ...normalUser, email: null }),
      e_learning_purchases: makePurchaseCountChain(0),
    })
    const { create } = mockStripe()

    await startCheckout(BASE_INPUT)
    const arg = create.mock.calls[0][0]
    expect(arg.customer_email).toBeUndefined()
  })
})
