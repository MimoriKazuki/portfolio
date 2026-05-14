import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { getMyPurchases } from '../get-purchases'

// ----------------------------------------------------------------
// チェーンスタブ ビルダー
// ----------------------------------------------------------------

// .select().eq().order() → { data, error }
function makePurchasesChain(data: unknown[], error: unknown = null) {
  const result = { data, error }
  const order = vi.fn().mockResolvedValue(result)
  const eq = vi.fn(() => ({ order }))
  const select = vi.fn(() => ({ eq }))
  return { select }
}

function mockClient(stub: ReturnType<typeof makePurchasesChain>) {
  const from = vi.fn(() => stub)
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// テストデータ
// ----------------------------------------------------------------

const base = {
  stripe_session_id: 'cs_test_123',
  amount: 9800,
  refunded_at: null,
  created_at: '2026-05-01T10:00:00Z',
}

const rawCompleted = {
  ...base,
  id: 'p-1',
  course_id: 'course-1',
  content_id: null,
  status: 'completed',
  course: { title: 'AI 入門', slug: 'intro-ai' },
  content: null,
}

const rawRefunded = {
  ...base,
  id: 'p-2',
  course_id: null,
  content_id: 'content-1',
  status: 'refunded',
  refunded_at: '2026-05-02T10:00:00Z',
  course: null,
  content: { title: 'ChatGPT 活用術' },
}

const rawArrayJoin = {
  ...base,
  id: 'p-3',
  course_id: 'course-2',
  content_id: null,
  status: 'completed',
  course: [{ title: 'LLM 基礎', slug: 'llm' }],  // 配列形式
  content: null,
}

// ----------------------------------------------------------------
// getMyPurchases
// ----------------------------------------------------------------
describe('getMyPurchases', () => {
  it('正常系：completed / refunded を分離して返す', async () => {
    mockClient(makePurchasesChain([rawCompleted, rawRefunded]))
    const result = await getMyPurchases('eu-1')
    expect(result.completed).toHaveLength(1)
    expect(result.completed[0].id).toBe('p-1')
    expect(result.refunded).toHaveLength(1)
    expect(result.refunded[0].id).toBe('p-2')
  })

  it('course JOIN を正規化：course_title / course_slug を解決する', async () => {
    mockClient(makePurchasesChain([rawCompleted]))
    const result = await getMyPurchases('eu-1')
    expect(result.completed[0].course_title).toBe('AI 入門')
    expect(result.completed[0].course_slug).toBe('intro-ai')
  })

  it('content JOIN を正規化：content_title を解決する', async () => {
    mockClient(makePurchasesChain([rawRefunded]))
    const result = await getMyPurchases('eu-1')
    expect(result.refunded[0].content_title).toBe('ChatGPT 活用術')
  })

  it('course が配列形式で返っても正規化する', async () => {
    mockClient(makePurchasesChain([rawArrayJoin]))
    const result = await getMyPurchases('eu-1')
    expect(result.completed[0].course_title).toBe('LLM 基礎')
    expect(result.completed[0].course_slug).toBe('llm')
  })

  it('空配列：completed / refunded 両方空', async () => {
    mockClient(makePurchasesChain([]))
    const result = await getMyPurchases('eu-1')
    expect(result.completed).toEqual([])
    expect(result.refunded).toEqual([])
  })

  it('DB エラー：console.error + 両方空（throw しない）', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockClient(makePurchasesChain([], { code: 'PGRST301', message: 'db error' }))
    const result = await getMyPurchases('eu-1')
    expect(result.completed).toEqual([])
    expect(result.refunded).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('refunded_at が設定されているとき正しく渡される', async () => {
    mockClient(makePurchasesChain([rawRefunded]))
    const result = await getMyPurchases('eu-1')
    expect(result.refunded[0].refunded_at).toBe('2026-05-02T10:00:00Z')
  })
})
