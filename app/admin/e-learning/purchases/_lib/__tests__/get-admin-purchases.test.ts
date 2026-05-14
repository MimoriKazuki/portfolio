import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { getAdminPurchases } from '../get-admin-purchases'

// ----------------------------------------------------------------
// Thenable chain builder（e_learning_purchases 用）
// ----------------------------------------------------------------
function makePurchasesChain(data: unknown, error: unknown = null) {
  const chain: Record<string, unknown> = {}
  const resolveValue = { data, error }
  chain.then = (onFulfilled: (v: unknown) => unknown) => Promise.resolve(resolveValue).then(onFulfilled)
  chain.catch = (onRejected: (e: unknown) => unknown) => Promise.resolve(resolveValue).catch(onRejected)
  const methods = ['select', 'order', 'in', 'eq', 'not', 'is', 'gte', 'lte']
  for (const m of methods) {
    chain[m] = vi.fn(() => chain)
  }
  return chain
}

// userKeyword 逆引き用 SELECT チェーン（or().resolves の形）
function makeUserLookupChain(users: Array<{ id: string }>) {
  const orResult = Promise.resolve({ data: users, error: null })
  const or = vi.fn(() => orResult)
  const select = vi.fn(() => ({ or }))
  return { select, or }
}

const purchaseRow = {
  id: 'pur-001',
  user_id: 'eu-001',
  course_id: 'c-001',
  content_id: null,
  stripe_session_id: 'cs_001',
  stripe_payment_intent_id: 'pi_001',
  amount: 9800,
  status: 'completed',
  refunded_at: null,
  created_at: '2026-01-01T00:00:00Z',
  user: { display_name: 'テストユーザー', email: 'user@example.com' },
  course: { title: 'テストコース', slug: 'test-course' },
  content: null,
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// 正常系
// ----------------------------------------------------------------
describe('getAdminPurchases — 正常系', () => {
  it('JOIN（user/course/content）の結果を整形して返す', async () => {
    const chain = makePurchasesChain([purchaseRow])
    const from = vi.fn(() => chain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    const result = await getAdminPurchases()
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      user_display_name: 'テストユーザー',
      user_email: 'user@example.com',
      course_title: 'テストコース',
      course_slug: 'test-course',
      content_title: null,
      status: 'completed',
    })
  })

  it('user / course / content が配列形式で返ってきても正規化される', async () => {
    const rowWithArrays = {
      ...purchaseRow,
      user: [{ display_name: '配列ユーザー', email: 'arr@example.com' }],
      course: [{ title: '配列コース', slug: 'arr-course' }],
      content: [{ title: '配列コンテンツ' }],
    }
    const chain = makePurchasesChain([rowWithArrays])
    const from = vi.fn(() => chain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    const result = await getAdminPurchases()
    expect(result[0].user_display_name).toBe('配列ユーザー')
    expect(result[0].course_title).toBe('配列コース')
    expect(result[0].content_title).toBe('配列コンテンツ')
  })

  it('status=refunded のレコード → status が refunded として返る', async () => {
    const refundedRow = { ...purchaseRow, status: 'refunded', refunded_at: '2026-02-01T00:00:00Z' }
    const chain = makePurchasesChain([refundedRow])
    const from = vi.fn(() => chain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    const result = await getAdminPurchases()
    expect(result[0].status).toBe('refunded')
    expect(result[0].refunded_at).toBe('2026-02-01T00:00:00Z')
  })
})

// ----------------------------------------------------------------
// userKeyword 逆引き
// ----------------------------------------------------------------
describe('getAdminPurchases — userKeyword 逆引き', () => {
  it('userKeyword あり → user_id IN matchedUserIds が呼ばれる', async () => {
    const userChain = makeUserLookupChain([{ id: 'eu-001' }])
    const purchasesChain = makePurchasesChain([purchaseRow])

    let callCount = 0
    const from = vi.fn((table: string) => {
      if (table === 'e_learning_users') {
        callCount++
        if (callCount === 1) return userChain
      }
      return purchasesChain
    })
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    await getAdminPurchases({ userKeyword: 'テスト' })
    expect(purchasesChain.in).toHaveBeenCalledWith('user_id', ['eu-001'])
  })

  it('userKeyword でヒットなし（matchedUserIds=[]）→ [] を早期 return', async () => {
    const userChain = makeUserLookupChain([]) // 0件
    const purchasesChain = makePurchasesChain([purchaseRow])

    const from = vi.fn((table: string) => {
      if (table === 'e_learning_users') return userChain
      return purchasesChain
    })
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    const result = await getAdminPurchases({ userKeyword: 'nomatch' })
    expect(result).toEqual([])
    // e_learning_purchases の from は呼ばれない
    expect(purchasesChain.select).not.toHaveBeenCalled()
  })

  it('userKeyword のエスケープ（% → \\%）', async () => {
    const userChain = makeUserLookupChain([])
    const from = vi.fn(() => userChain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    await getAdminPurchases({ userKeyword: '100%' })
    const orArg = (userChain.or as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(orArg).toContain('\\%')
  })
})

// ----------------------------------------------------------------
// targetType フィルタ
// ----------------------------------------------------------------
describe('getAdminPurchases — targetType フィルタ', () => {
  it('target=course → not(course_id, is, null) が呼ばれる', async () => {
    const chain = makePurchasesChain([])
    const from = vi.fn(() => chain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    await getAdminPurchases({ targetType: 'course' })
    expect(chain.not).toHaveBeenCalledWith('course_id', 'is', null)
  })

  it('target=content → not(content_id, is, null) が呼ばれる', async () => {
    const chain = makePurchasesChain([])
    const from = vi.fn(() => chain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    await getAdminPurchases({ targetType: 'content' })
    expect(chain.not).toHaveBeenCalledWith('content_id', 'is', null)
  })

  it('target=legacy → is(course_id,null) + is(content_id,null) が呼ばれる', async () => {
    const chain = makePurchasesChain([])
    const from = vi.fn(() => chain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    await getAdminPurchases({ targetType: 'legacy' })
    expect(chain.is).toHaveBeenCalledWith('course_id', null)
    expect(chain.is).toHaveBeenCalledWith('content_id', null)
  })

  it('target=all → not も is も呼ばれない', async () => {
    const chain = makePurchasesChain([])
    const from = vi.fn(() => chain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    await getAdminPurchases({ targetType: 'all' })
    expect(chain.not).not.toHaveBeenCalled()
    // is は legacy フィルタ専用（deleted_at フィルタは getAdminUsers 側）
  })
})

// ----------------------------------------------------------------
// status フィルタ
// ----------------------------------------------------------------
describe('getAdminPurchases — status フィルタ', () => {
  it('status=completed → eq(status, completed) が呼ばれる', async () => {
    const chain = makePurchasesChain([])
    const from = vi.fn(() => chain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    await getAdminPurchases({ status: 'completed' })
    expect(chain.eq).toHaveBeenCalledWith('status', 'completed')
  })

  it('status=refunded → eq(status, refunded) が呼ばれる', async () => {
    const chain = makePurchasesChain([])
    const from = vi.fn(() => chain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    await getAdminPurchases({ status: 'refunded' })
    expect(chain.eq).toHaveBeenCalledWith('status', 'refunded')
  })

  it('status=all → eq(status, ...) は呼ばれない', async () => {
    const chain = makePurchasesChain([])
    const from = vi.fn(() => chain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    await getAdminPurchases({ status: 'all' })
    expect(chain.eq).not.toHaveBeenCalled()
  })
})

// ----------------------------------------------------------------
// from / to 期間フィルタ
// ----------------------------------------------------------------
describe('getAdminPurchases — 期間フィルタ', () => {
  it('from 指定 → gte(created_at, from) が呼ばれる', async () => {
    const chain = makePurchasesChain([])
    const from = vi.fn(() => chain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    await getAdminPurchases({ from: '2026-01-01' })
    expect(chain.gte).toHaveBeenCalledWith('created_at', '2026-01-01')
  })

  it('to 指定 → lte(created_at, to) が呼ばれる', async () => {
    const chain = makePurchasesChain([])
    const from = vi.fn(() => chain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    await getAdminPurchases({ to: '2026-12-31' })
    expect(chain.lte).toHaveBeenCalledWith('created_at', '2026-12-31')
  })
})

// ----------------------------------------------------------------
// DB エラー
// ----------------------------------------------------------------
describe('getAdminPurchases — DB エラー', () => {
  it('DB エラー → [] + console.error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const chain = makePurchasesChain(null, { code: 'PGRST301', message: 'error' })
    const from = vi.fn(() => chain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    const result = await getAdminPurchases()
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
