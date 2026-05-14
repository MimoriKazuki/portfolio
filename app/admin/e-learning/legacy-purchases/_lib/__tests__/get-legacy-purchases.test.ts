import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { getLegacyPurchases } from '../get-legacy-purchases'

// .select().order() chain
function makeOrderChain(data: unknown, error: unknown = null) {
  const order = vi.fn().mockResolvedValue({ data, error })
  const select = vi.fn(() => ({ order }))
  return { select, order }
}

function mockClient(chain: ReturnType<typeof makeOrderChain>) {
  const from = vi.fn(() => chain)
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { from }
}

const baseRow = {
  id: 'lp-001',
  user_id: 'eu-001',
  content_id: null,
  stripe_session_id: 'cs_legacy_001',
  amount: 9800,
  status: 'completed',
  original_created_at: '2024-01-01T00:00:00Z',
  migrated_at: '2026-01-01T00:00:00Z',
  note: null,
  user: { display_name: 'テストユーザー', email: 'user@example.com' },
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('getLegacyPurchases', () => {
  it('正常系：user JOIN を展開して LegacyPurchaseRow を返す', async () => {
    const chain = makeOrderChain([baseRow])
    mockClient(chain)
    const result = await getLegacyPurchases()
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'lp-001',
      user_id: 'eu-001',
      user_display_name: 'テストユーザー',
      user_email: 'user@example.com',
      amount: 9800,
      status: 'completed',
    })
  })

  it('user が配列形式で返ってきても正規化される（Supabase to-one JOIN 配列対応）', async () => {
    const rowWithArray = {
      ...baseRow,
      user: [{ display_name: '配列ユーザー', email: 'arr@example.com' }],
    }
    const chain = makeOrderChain([rowWithArray])
    mockClient(chain)
    const result = await getLegacyPurchases()
    expect(result[0].user_display_name).toBe('配列ユーザー')
    expect(result[0].user_email).toBe('arr@example.com')
  })

  it('user が null → user_display_name/user_email は null', async () => {
    const rowNoUser = { ...baseRow, user: null }
    const chain = makeOrderChain([rowNoUser])
    mockClient(chain)
    const result = await getLegacyPurchases()
    expect(result[0].user_display_name).toBeNull()
    expect(result[0].user_email).toBeNull()
  })

  it('status が refunded のレコードはそのまま保持される', async () => {
    const refundedRow = { ...baseRow, id: 'lp-002', status: 'refunded' }
    const chain = makeOrderChain([refundedRow])
    mockClient(chain)
    const result = await getLegacyPurchases()
    expect(result[0].status).toBe('refunded')
  })

  it('content_id が null のレコード（全コンテンツ買い切り）を正しく返す', async () => {
    const chain = makeOrderChain([{ ...baseRow, content_id: null }])
    mockClient(chain)
    const result = await getLegacyPurchases()
    expect(result[0].content_id).toBeNull()
  })

  it('note が null / 非 null いずれも正しく返す', async () => {
    const chain = makeOrderChain([
      { ...baseRow, id: 'lp-note-1', note: null },
      { ...baseRow, id: 'lp-note-2', note: '早期購入者' },
    ])
    mockClient(chain)
    const result = await getLegacyPurchases()
    expect(result[0].note).toBeNull()
    expect(result[1].note).toBe('早期購入者')
  })

  it('複数レコードをすべて返す', async () => {
    const rows = [
      baseRow,
      { ...baseRow, id: 'lp-002', user: { display_name: '2人目', email: '2@example.com' } },
      { ...baseRow, id: 'lp-003', user: { display_name: '3人目', email: '3@example.com' } },
    ]
    const chain = makeOrderChain(rows)
    mockClient(chain)
    const result = await getLegacyPurchases()
    expect(result).toHaveLength(3)
  })

  it('DB エラー → [] + console.error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const chain = makeOrderChain(null, { code: 'PGRST301', message: 'error' })
    mockClient(chain)
    const result = await getLegacyPurchases()
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('data が null（空レスポンス）→ []', async () => {
    const chain = makeOrderChain(null)
    mockClient(chain)
    const result = await getLegacyPurchases()
    expect(result).toEqual([])
  })
})
