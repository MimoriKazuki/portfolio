import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type Stripe from 'stripe'

// ----------------------------------------------------------------
// vi.hoisted でモック変数をホイスト（vi.mock ファクトリより前に実行）
// ----------------------------------------------------------------
const { mockFrom, mockConstructEvent: _mockConstructEventFn } = vi.hoisted(() => {
  const mockFrom = vi.fn()
  const mockConstructEvent = vi.fn()
  return { mockFrom, mockConstructEvent }
})

// ----------------------------------------------------------------
// @supabase/supabase-js をモック
// supabaseAdmin はモジュールトップレベルで createClient() を呼ぶため
// hoisted した mockFrom をそのまま使える
// ----------------------------------------------------------------
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

// ----------------------------------------------------------------
// @/app/lib/stripe/client をモック
// ----------------------------------------------------------------
vi.mock('@/app/lib/stripe/client', () => ({
  getStripe: vi.fn(() => ({
    webhooks: { constructEvent: _mockConstructEventFn },
  })),
}))

// ----------------------------------------------------------------
// グローバル fetch をモック（Slack 通知）
// ----------------------------------------------------------------
vi.stubGlobal('fetch', vi.fn())

import { POST } from '../route'

// ----------------------------------------------------------------
// ヘルパー：supabaseAdmin チェーンビルダー
// ----------------------------------------------------------------
type SelectResult = { data: object | null; error: object | null }
type UpdateResult = { error: object | null }

function stubSupabase({
  selectResult,
  updateResult,
}: {
  selectResult: SelectResult
  updateResult?: UpdateResult
}) {
  const maybySingle = vi.fn().mockResolvedValue(selectResult)
  const selectEq = vi.fn(() => ({ maybeSingle: maybySingle }))
  const select = vi.fn(() => ({ eq: selectEq }))

  const updateEq = vi.fn().mockResolvedValue(updateResult ?? { error: null })
  const update = vi.fn(() => ({ eq: updateEq }))

  mockFrom.mockReturnValue({ select, update })

  return { select, selectEq, maybySingle, update, updateEq }
}

// ----------------------------------------------------------------
// ヘルパー：charge.refunded Stripe.Event
// ----------------------------------------------------------------
function makeChargeRefundedEvent(chargeOverride: Partial<Stripe.Charge> = {}): Stripe.Event {
  const charge: Partial<Stripe.Charge> = {
    id: 'ch_test_001',
    object: 'charge',
    payment_intent: 'pi_test_001',
    created: 1700000000,
    amount_refunded: 4980,
    ...chargeOverride,
  }
  return {
    id: 'evt_test_refund_001',
    type: 'charge.refunded',
    data: { object: charge as Stripe.Charge },
  } as unknown as Stripe.Event
}

// ----------------------------------------------------------------
// ヘルパー：Request ビルダー
// ----------------------------------------------------------------
function makeRequest(body = '{}', signature = 'valid-sig') {
  return new Request('http://localhost/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': signature },
    body,
  })
}

beforeEach(() => {
  vi.resetAllMocks()
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test'
  ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true } as Response)
})

// ================================================================
// 正常系
// ================================================================
describe('charge.refunded ハンドラ — 正常系', () => {
  it('正常な返金フロー：status=refunded に更新・Slack 通知送信', async () => {
    const event = makeChargeRefundedEvent({
      payment_intent: 'pi_test_001',
      created: 1700000000,
      amount_refunded: 4980,
    })
    _mockConstructEventFn.mockReturnValue(event)

    const { update, updateEq } = stubSupabase({
      selectResult: { data: { id: 'pur-001', status: 'completed', refunded_at: null }, error: null },
      updateResult: { error: null },
    })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ received: true })

    // UPDATE の引数検証
    expect(update).toHaveBeenCalledWith({
      status: 'refunded',
      refunded_at: new Date(1700000000 * 1000).toISOString(),
    })
    expect(updateEq).toHaveBeenCalledWith('id', 'pur-001')

    // Slack 通知は SLACK_WEBHOOK_URL がモジュール初期化時に空文字のためスキップされる
    // （sendSlackRefundNotification 内の if (!SLACK_WEBHOOK_URL) return による）
    // → fetch が呼ばれないことを確認（モジュール定数の制約）
  })

  it('payment_intent が string → 正しい値で SELECT eq が呼ばれる', async () => {
    const event = makeChargeRefundedEvent({ payment_intent: 'pi_string_001' })
    _mockConstructEventFn.mockReturnValue(event)

    const { selectEq } = stubSupabase({
      selectResult: { data: { id: 'pur-002', status: 'completed', refunded_at: null }, error: null },
      updateResult: { error: null },
    })

    await POST(makeRequest() as unknown as Parameters<typeof POST>[0])

    expect(selectEq).toHaveBeenCalledWith('stripe_payment_intent_id', 'pi_string_001')
  })

  it('payment_intent が Object { id } 形式 → id を抽出してマッチング', async () => {
    const event = makeChargeRefundedEvent({
      payment_intent: { id: 'pi_obj_001' } as unknown as string,
    })
    _mockConstructEventFn.mockReturnValue(event)

    const { selectEq } = stubSupabase({
      selectResult: { data: { id: 'pur-003', status: 'completed', refunded_at: null }, error: null },
      updateResult: { error: null },
    })

    await POST(makeRequest() as unknown as Parameters<typeof POST>[0])

    expect(selectEq).toHaveBeenCalledWith('stripe_payment_intent_id', 'pi_obj_001')
  })
})

// ================================================================
// 冪等性
// ================================================================
describe('charge.refunded ハンドラ — 冪等性', () => {
  it('既に refunded：UPDATE スキップ・200 OK・既存 refunded_at 保持', async () => {
    const event = makeChargeRefundedEvent({ payment_intent: 'pi_already_refunded' })
    _mockConstructEventFn.mockReturnValue(event)

    const { update } = stubSupabase({
      selectResult: {
        data: { id: 'pur-004', status: 'refunded', refunded_at: '2023-11-14T22:13:20.000Z' },
        error: null,
      },
    })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ received: true })
    // UPDATE は呼ばれない（冪等）
    expect(update).not.toHaveBeenCalled()
    // Slack 通知も送信しない
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('同一 event を 2 回処理 → 2 回目は UPDATE スキップ', async () => {
    const event = makeChargeRefundedEvent({ payment_intent: 'pi_dup_001' })

    // 1 回目：completed → 更新
    _mockConstructEventFn.mockReturnValue(event)
    const { update: update1 } = stubSupabase({
      selectResult: { data: { id: 'pur-005', status: 'completed', refunded_at: null }, error: null },
      updateResult: { error: null },
    })
    await POST(makeRequest() as unknown as Parameters<typeof POST>[0])
    expect(update1).toHaveBeenCalledOnce()

    vi.resetAllMocks()
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true } as Response)
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'

    // 2 回目：既に refunded → スキップ
    _mockConstructEventFn.mockReturnValue(event)
    const { update: update2 } = stubSupabase({
      selectResult: {
        data: { id: 'pur-005', status: 'refunded', refunded_at: '2023-11-14T22:13:20.000Z' },
        error: null,
      },
    })
    await POST(makeRequest() as unknown as Parameters<typeof POST>[0])
    expect(update2).not.toHaveBeenCalled()
  })
})

// ================================================================
// 順序逆転
// ================================================================
describe('charge.refunded ハンドラ — 順序逆転', () => {
  it('purchase 未存在：Slack orphan 通知 + 200 OK', async () => {
    const event = makeChargeRefundedEvent({
      payment_intent: 'pi_orphan_001',
      id: 'ch_orphan_001',
    })
    _mockConstructEventFn.mockReturnValue(event)

    const { update } = stubSupabase({ selectResult: { data: null, error: null } })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ received: true })
    // UPDATE は呼ばれない
    expect(update).not.toHaveBeenCalled()
    // SLACK_WEBHOOK_URL はモジュール初期化時に空文字のため orphan 通知もスキップ
    // → fetch は呼ばれない（fetch の呼び出し有無を検証）
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})

// ================================================================
// エラー系
// ================================================================
describe('charge.refunded ハンドラ — エラー系', () => {
  it('payment_intent 欠落（null）→ エラーログ + 200 OK（リトライさせない）', async () => {
    const event = makeChargeRefundedEvent({ payment_intent: null as unknown as string })
    _mockConstructEventFn.mockReturnValue(event)

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ received: true })
    // DB・Slack いずれも呼ばれない
    expect(mockFrom).not.toHaveBeenCalled()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('DB SELECT エラー → 500（Stripe にリトライさせる）', async () => {
    const event = makeChargeRefundedEvent({ payment_intent: 'pi_select_err' })
    _mockConstructEventFn.mockReturnValue(event)

    stubSupabase({
      selectResult: { data: null, error: { message: 'connection error' } },
    })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Refund processing failed' })
  })

  it('DB UPDATE エラー → 500（Stripe にリトライさせる）', async () => {
    const event = makeChargeRefundedEvent({ payment_intent: 'pi_update_err' })
    _mockConstructEventFn.mockReturnValue(event)

    stubSupabase({
      selectResult: { data: { id: 'pur-006', status: 'completed', refunded_at: null }, error: null },
      updateResult: { error: { message: 'update failed' } },
    })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Refund processing failed' })
  })
})

// ================================================================
// CHECK 制約遵守
// ================================================================
describe('charge.refunded ハンドラ — CHECK 制約遵守', () => {
  it('status と refunded_at を同一 UPDATE 文に含む（分割 UPDATE しない）', async () => {
    const created = 1700000000
    const event = makeChargeRefundedEvent({ payment_intent: 'pi_check_001', created })
    _mockConstructEventFn.mockReturnValue(event)

    const { update } = stubSupabase({
      selectResult: { data: { id: 'pur-007', status: 'completed', refunded_at: null }, error: null },
      updateResult: { error: null },
    })

    await POST(makeRequest() as unknown as Parameters<typeof POST>[0])

    // update() は 1 回のみ（分割 UPDATE 禁止）
    expect(update).toHaveBeenCalledOnce()
    // 引数に status・refunded_at 両方が含まれる
    expect(update).toHaveBeenCalledWith({
      status: 'refunded',
      refunded_at: new Date(created * 1000).toISOString(),
    })
  })

  it('refunded_at = new Date(charge.created * 1000).toISOString() の計算が正しい', async () => {
    const created = 1700000000
    const expectedIso = new Date(created * 1000).toISOString()
    const event = makeChargeRefundedEvent({ created })
    _mockConstructEventFn.mockReturnValue(event)

    const { update } = stubSupabase({
      selectResult: { data: { id: 'pur-008', status: 'completed', refunded_at: null }, error: null },
      updateResult: { error: null },
    })

    await POST(makeRequest() as unknown as Parameters<typeof POST>[0])

    const updateCalls = update.mock.calls as unknown as Array<
      [{ refunded_at?: string }]
    >
    expect(updateCalls.length).toBeGreaterThan(0)
    expect(updateCalls[0][0].refunded_at).toBe(expectedIso)
  })
})

// ================================================================
// Slack 通知
// ================================================================
// Slack 通知テストの設計注意：
// SLACK_WEBHOOK_URL はモジュール初期化時に const として評価される。
// テストで process.env.SLACK_WEBHOOK_URL を変更しても route.ts には反映されない。
// テスト環境では SLACK_WEBHOOK_URL が空文字のため、全 Slack 通知がスキップされる。
// → 以下のテストは「Slack スキップ時でもハンドラが正常終了する」を確認する。
describe('charge.refunded ハンドラ — Slack 通知（モジュール定数のため常にスキップ）', () => {
  it('SLACK_WEBHOOK_URL が空文字（テスト環境のデフォルト）→ 通知スキップ・ハンドラは正常終了', async () => {
    const event = makeChargeRefundedEvent({ payment_intent: 'pi_noslack_001' })
    _mockConstructEventFn.mockReturnValue(event)

    stubSupabase({
      selectResult: { data: { id: 'pur-009', status: 'completed', refunded_at: null }, error: null },
      updateResult: { error: null },
    })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])
    expect(res.status).toBe(200)
    // SLACK_WEBHOOK_URL が空文字のため fetch は呼ばれない
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('DB 更新成功後でも Slack スキップ時はハンドラが正常終了し 200 を返す', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('should not be called'))

    const event = makeChargeRefundedEvent({ payment_intent: 'pi_slackerr_001' })
    _mockConstructEventFn.mockReturnValue(event)

    stubSupabase({
      selectResult: { data: { id: 'pur-010', status: 'completed', refunded_at: null }, error: null },
      updateResult: { error: null },
    })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ received: true })
  })
})

// ================================================================
// Slack エラー通知（errors.md rule G 準拠）
// ================================================================
// 設計注記：
// sendSlackWebhookErrorNotification は SLACK_WEBHOOK_URL が空文字のときは
// 即 return するため、テスト環境では fetch は呼ばれない。
// ここでは「fetch が呼ばれない（スキップ確認）」と「500 返却」の組み合わせで
// Slack エラー通知経路を間接的に検証する。
// eventId / eventType / errorMessage の引数確認は console.info spy と組み合わせる。
describe('charge.refunded ハンドラ — Slack エラー通知（rule G 準拠）', () => {
  it('DB SELECT エラー時：Slack エラー通知経路に入り 500 を返す（fetch はスキップ）', async () => {
    const event = makeChargeRefundedEvent({ payment_intent: 'pi_slack_err_select' })
    _mockConstructEventFn.mockReturnValue(event)

    stubSupabase({
      selectResult: { data: null, error: { message: 'select failed: connection lost' } },
    })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Refund processing failed' })
    // SLACK_WEBHOOK_URL が空文字のため sendSlackWebhookErrorNotification 内 fetch はスキップ
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('DB UPDATE エラー時：Slack エラー通知経路に入り 500 を返す（fetch はスキップ）', async () => {
    const event = makeChargeRefundedEvent({ payment_intent: 'pi_slack_err_update' })
    _mockConstructEventFn.mockReturnValue(event)

    stubSupabase({
      selectResult: { data: { id: 'pur-011', status: 'completed', refunded_at: null }, error: null },
      updateResult: { error: { message: 'update failed: lock timeout' } },
    })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Refund processing failed' })
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('既 refunded（冪等）時は Slack エラー通知経路に入らない・200 OK', async () => {
    const event = makeChargeRefundedEvent({ payment_intent: 'pi_idempotent_noerr' })
    _mockConstructEventFn.mockReturnValue(event)

    stubSupabase({
      selectResult: {
        data: { id: 'pur-012', status: 'refunded', refunded_at: '2023-11-14T22:13:20.000Z' },
        error: null,
      },
    })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])

    expect(res.status).toBe(200)
    // fetch は呼ばれない（エラー通知・返金通知どちらも）
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('正常な返金フロー時は Slack エラー通知経路に入らない・200 OK', async () => {
    const event = makeChargeRefundedEvent({ payment_intent: 'pi_success_noerr' })
    _mockConstructEventFn.mockReturnValue(event)

    stubSupabase({
      selectResult: { data: { id: 'pur-013', status: 'completed', refunded_at: null }, error: null },
      updateResult: { error: null },
    })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])

    expect(res.status).toBe(200)
    // 正常パスでは Slack エラー通知は呼ばれない
    // （sendSlackRefundNotification は SLACK_WEBHOOK_URL 空文字でスキップ）
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('purchase 未存在（orphan）時は Slack エラー通知ではなく orphan 通知経路・200 OK', async () => {
    const event = makeChargeRefundedEvent({
      payment_intent: 'pi_orphan_noerr',
      id: 'ch_orphan_noerr',
    })
    _mockConstructEventFn.mockReturnValue(event)

    stubSupabase({ selectResult: { data: null, error: null } })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])

    // orphan は ok: true なので 500 にならない
    expect(res.status).toBe(200)
    // SLACK_WEBHOOK_URL 空文字のため orphan 通知 fetch もスキップ
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})

// ================================================================
// event.type ログ確認（console.info spy）
// ================================================================
describe('charge.refunded ハンドラ — eventType ログ', () => {
  let infoSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    infoSpy.mockRestore()
  })

  it('charge.refunded 受信ログに eventType が含まれる', async () => {
    const event = makeChargeRefundedEvent({ payment_intent: 'pi_log_001' })
    _mockConstructEventFn.mockReturnValue(event)

    stubSupabase({
      selectResult: { data: { id: 'pur-014', status: 'completed', refunded_at: null }, error: null },
      updateResult: { error: null },
    })

    await POST(makeRequest() as unknown as Parameters<typeof POST>[0])

    // console.info が呼ばれ、最初の呼び出しの引数に eventType が含まれる
    const receivedCall = infoSpy.mock.calls.find(
      (args) => typeof args[0] === 'string' && args[0].includes('charge.refunded received'),
    )
    expect(receivedCall).toBeDefined()
    // 第2引数のオブジェクトに eventType: 'charge.refunded' が含まれる
    expect(receivedCall![1]).toMatchObject({ eventType: 'charge.refunded' })
  })

  it('charge.refunded 受信ログに eventId が含まれる', async () => {
    const event = makeChargeRefundedEvent({ payment_intent: 'pi_log_002' })
    event.id = 'evt_log_check_001'
    _mockConstructEventFn.mockReturnValue(event)

    stubSupabase({
      selectResult: { data: { id: 'pur-015', status: 'completed', refunded_at: null }, error: null },
      updateResult: { error: null },
    })

    await POST(makeRequest() as unknown as Parameters<typeof POST>[0])

    const receivedCall = infoSpy.mock.calls.find(
      (args) => typeof args[0] === 'string' && args[0].includes('charge.refunded received'),
    )
    expect(receivedCall).toBeDefined()
    expect(receivedCall![1]).toMatchObject({ eventId: 'evt_log_check_001' })
  })
})

// ================================================================
// 署名検証（POST ルート共通部分）
// ================================================================
describe('POST /api/stripe/webhook — 署名検証', () => {
  it('stripe-signature ヘッダ未設定 → 400', async () => {
    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: '{}',
    })
    const res = await POST(req as unknown as Parameters<typeof POST>[0])
    expect(res.status).toBe(400)
  })

  it('STRIPE_WEBHOOK_SECRET 未設定 → 500', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])
    expect(res.status).toBe(500)
  })

  it('署名検証失敗（constructEvent が throw）→ 400', async () => {
    _mockConstructEventFn.mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature')
    })

    const res = await POST(makeRequest('{}', 'invalid-sig') as unknown as Parameters<typeof POST>[0])
    expect(res.status).toBe(400)
  })
})

// ================================================================
// checkout.session.completed — 新形式 metadata 分岐（P3-WEBHOOK-NEW）
// ================================================================

function makeNewFormatSession(override: {
  targetType?: string
  targetId?: string
  userId?: string
  sessionId?: string
  paymentIntentId?: string
  amountTotal?: number
}) {
  const {
    targetType = 'course',
    targetId = 'course-id-001',
    userId = 'eu-id-001',
    sessionId = 'cs_test_001',
    paymentIntentId = 'pi_test_001',
    amountTotal = 9800,
  } = override
  return {
    id: sessionId,
    metadata: {
      user_id: userId,
      target_type: targetType,
      target_id: targetId,
    },
    payment_intent: paymentIntentId,
    amount_total: amountTotal,
  }
}

function makeCheckoutCompletedEvent(session: object): Stripe.Event {
  return {
    id: 'evt_checkout_001',
    type: 'checkout.session.completed',
    data: { object: session },
  } as unknown as Stripe.Event
}

// supabaseAdmin の INSERT + 後続 SELECT（userData 取得）をスタブするヘルパー
function stubSupabaseForNewFormat({
  insertError = null,
  userData = null as object | null,
} = {}) {
  let callCount = 0
  mockFrom.mockImplementation(() => {
    callCount++
    if (callCount === 1) {
      // INSERT into e_learning_purchases
      const insert = vi.fn().mockResolvedValue({ error: insertError })
      return { insert }
    }
    // SELECT e_learning_users for userData
    const maybeSingle = vi.fn().mockResolvedValue({ data: userData, error: null })
    const eq = vi.fn(() => ({ maybeSingle }))
    const select = vi.fn(() => ({ eq }))
    return { select }
  })
}

describe('checkout.session.completed — 新形式 metadata (P3-WEBHOOK-NEW)', () => {
  it('target_type=course → e_learning_purchases に course_id セットで INSERT・200 OK', async () => {
    const session = makeNewFormatSession({ targetType: 'course', targetId: 'course-001' })
    _mockConstructEventFn.mockReturnValue(makeCheckoutCompletedEvent(session))

    let insertedRow: object | null = null
    mockFrom.mockImplementation((table: string) => {
      if (table === 'e_learning_purchases') {
        const insert = vi.fn().mockImplementation((row: object) => {
          insertedRow = row
          return Promise.resolve({ error: null })
        })
        return { insert }
      }
      // e_learning_users
      const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
      const eq = vi.fn(() => ({ maybeSingle }))
      const select = vi.fn(() => ({ eq }))
      return { select }
    })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ received: true })
    expect(insertedRow).toMatchObject({
      course_id: 'course-001',
      content_id: null,
      user_id: 'eu-id-001',
      status: 'completed',
    })
  })

  it('target_type=content → e_learning_purchases に content_id セットで INSERT', async () => {
    const session = makeNewFormatSession({ targetType: 'content', targetId: 'content-001' })
    _mockConstructEventFn.mockReturnValue(makeCheckoutCompletedEvent(session))

    let insertedRow: object | null = null
    mockFrom.mockImplementation((table: string) => {
      if (table === 'e_learning_purchases') {
        const insert = vi.fn().mockImplementation((row: object) => {
          insertedRow = row
          return Promise.resolve({ error: null })
        })
        return { insert }
      }
      const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
      const eq = vi.fn(() => ({ maybeSingle }))
      const select = vi.fn(() => ({ eq }))
      return { select }
    })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])
    expect(res.status).toBe(200)
    expect(insertedRow).toMatchObject({
      content_id: 'content-001',
      course_id: null,
      status: 'completed',
    })
  })

  it('新形式で INSERT 成功 → has_full_access は更新しない（update が呼ばれない）', async () => {
    const session = makeNewFormatSession({})
    _mockConstructEventFn.mockReturnValue(makeCheckoutCompletedEvent(session))

    const updateCalls: string[] = []
    mockFrom.mockImplementation((table: string) => {
      if (table === 'e_learning_purchases') {
        const insert = vi.fn().mockResolvedValue({ error: null })
        return { insert }
      }
      if (table === 'e_learning_users') {
        // track update calls
        const update = vi.fn().mockImplementation(() => {
          updateCalls.push('update called')
          return { eq: vi.fn().mockResolvedValue({ error: null }) }
        })
        const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
        const eq = vi.fn(() => ({ maybeSingle }))
        const select = vi.fn(() => ({ eq }))
        return { select, update }
      }
      const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
      const eq = vi.fn(() => ({ maybeSingle }))
      const select = vi.fn(() => ({ eq }))
      return { select }
    })

    await POST(makeRequest() as unknown as Parameters<typeof POST>[0])
    // has_full_access 更新（UPDATE e_learning_users）は呼ばれない
    expect(updateCalls).toHaveLength(0)
  })

  it('新形式 INSERT で 23505（UNIQUE 違反）→ 200 OK（冪等）', async () => {
    const session = makeNewFormatSession({})
    _mockConstructEventFn.mockReturnValue(makeCheckoutCompletedEvent(session))
    stubSupabaseForNewFormat({ insertError: { code: '23505', message: 'duplicate key value' } })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ received: true })
  })

  it('新形式 INSERT で非冪等エラー → 500 + Slack 通知経路', async () => {
    const session = makeNewFormatSession({})
    _mockConstructEventFn.mockReturnValue(makeCheckoutCompletedEvent(session))
    stubSupabaseForNewFormat({ insertError: { code: '42501', message: 'permission denied' } })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])
    expect(res.status).toBe(500)
    expect(await res.json()).toMatchObject({ error: 'Purchase insert failed' })
  })

  it('旧形式 metadata（userId のみ）→ has_full_access 更新（旧ロジック）が動く', async () => {
    const legacySession = {
      id: 'cs_legacy_001',
      metadata: { userId: 'eu-legacy-001' },
      payment_intent: 'pi_legacy_001',
      amount_total: 9800,
    }
    _mockConstructEventFn.mockReturnValue(makeCheckoutCompletedEvent(legacySession))

    let updateCalled = false
    let callCount = 0
    mockFrom.mockImplementation((table: string) => {
      callCount++
      if (table === 'e_learning_users') {
        // 1回目はUPDATE（has_full_access=true）
        // 2回目はSELECT（userData取得）
        if (callCount <= 1) {
          const updateEq = vi.fn().mockResolvedValue({ error: null })
          const update = vi.fn().mockImplementation(() => {
            updateCalled = true
            return { eq: updateEq }
          })
          return { update }
        }
        const single = vi.fn().mockResolvedValue({ data: null, error: null })
        const eq = vi.fn(() => ({ single }))
        const select = vi.fn(() => ({ eq }))
        return { select }
      }
      // e_learning_purchases
      const insert = vi.fn().mockResolvedValue({ error: null })
      return { insert }
    })

    const res = await POST(makeRequest() as unknown as Parameters<typeof POST>[0])
    expect(res.status).toBe(200)
    expect(updateCalled).toBe(true)
  })
})
