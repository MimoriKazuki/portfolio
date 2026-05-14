import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { getAdminCourses, getAdminCategories } from '../get-admin-courses'

// ----------------------------------------------------------------
// Thenable chain builder for mutable queries
// ----------------------------------------------------------------
function makeThenableChain(data: unknown, error: unknown = null) {
  const chain: Record<string, unknown> = {}
  const resolveValue = { data, error }
  chain.then = (onFulfilled: (v: unknown) => unknown) => Promise.resolve(resolveValue).then(onFulfilled)
  chain.catch = (onRejected: (e: unknown) => unknown) => Promise.resolve(resolveValue).catch(onRejected)
  const methods = ['eq', 'is', 'not', 'in', 'ilike', 'order', 'select']
  for (const m of methods) {
    chain[m] = vi.fn(() => chain)
  }
  return chain
}

function makeIsChain(data: unknown, error: unknown = null) {
  const resolveValue = { data, error }
  const order = vi.fn().mockResolvedValue(resolveValue)
  const is = vi.fn(() => ({ order }))
  const select = vi.fn(() => ({ is }))
  return { select, is, order }
}

function mockClient(stub: ReturnType<typeof makeThenableChain>) {
  const from = vi.fn(() => stub)
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { from }
}

const courseRow = {
  id: 'c-001',
  slug: 'test-course',
  title: 'テストコース',
  category_id: 'cat-001',
  is_free: false,
  price: 9800,
  is_published: true,
  is_featured: false,
  stripe_price_id: 'price_001',
  deleted_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
  category: { name: 'AI基礎' },
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// getAdminCourses
// ----------------------------------------------------------------
describe('getAdminCourses', () => {
  it('正常系：rows を返す（category name を展開）', async () => {
    const chain = makeThenableChain([courseRow])
    mockClient(chain)
    const result = await getAdminCourses()
    expect(result).toHaveLength(1)
    expect(result[0].category_name).toBe('AI基礎')
    expect(result[0].title).toBe('テストコース')
  })

  it('status=published → eq(is_published,true) + is(deleted_at,null) が呼ばれる', async () => {
    const chain = makeThenableChain([courseRow])
    mockClient(chain)
    await getAdminCourses({ status: 'published' })
    expect(chain.eq).toHaveBeenCalledWith('is_published', true)
    expect(chain.is).toHaveBeenCalledWith('deleted_at', null)
  })

  it('status=draft → eq(is_published,false) + is(deleted_at,null)', async () => {
    const chain = makeThenableChain([courseRow])
    mockClient(chain)
    await getAdminCourses({ status: 'draft' })
    expect(chain.eq).toHaveBeenCalledWith('is_published', false)
    expect(chain.is).toHaveBeenCalledWith('deleted_at', null)
  })

  it('status=deleted → not(deleted_at,is,null) が呼ばれる', async () => {
    const chain = makeThenableChain([])
    mockClient(chain)
    await getAdminCourses({ status: 'deleted' })
    expect(chain.not).toHaveBeenCalledWith('deleted_at', 'is', null)
  })

  it('status=all → フィルタなし（eq も is も not も呼ばれない）', async () => {
    const chain = makeThenableChain([courseRow])
    mockClient(chain)
    await getAdminCourses({ status: 'all' })
    // status='all' はフィルタを付与しない
    expect(chain.eq).not.toHaveBeenCalled()
    expect(chain.is).not.toHaveBeenCalled()
    expect(chain.not).not.toHaveBeenCalled()
  })

  it('categoryIds フィルタ → in が呼ばれる', async () => {
    const chain = makeThenableChain([courseRow])
    mockClient(chain)
    await getAdminCourses({ categoryIds: ['cat-001', 'cat-002'] })
    expect(chain.in).toHaveBeenCalledWith('category_id', ['cat-001', 'cat-002'])
  })

  it('keyword フィルタ → ilike が呼ばれる', async () => {
    const chain = makeThenableChain([courseRow])
    mockClient(chain)
    await getAdminCourses({ keyword: 'AI' })
    expect(chain.ilike).toHaveBeenCalledWith('title', '%AI%')
  })

  it('keyword に % と _ が含まれる → エスケープされる', async () => {
    const chain = makeThenableChain([])
    mockClient(chain)
    await getAdminCourses({ keyword: '100%_off' })
    expect(chain.ilike).toHaveBeenCalledWith('title', '%100\\%\\_off%')
  })

  it('keyword が空白のみ → ilike は呼ばれない', async () => {
    const chain = makeThenableChain([courseRow])
    mockClient(chain)
    await getAdminCourses({ keyword: '   ' })
    expect(chain.ilike).not.toHaveBeenCalled()
  })

  it('category が配列形式でも category_name を正しく展開する', async () => {
    const rowWithArrayCat = { ...courseRow, category: [{ name: 'AI配列' }] }
    const chain = makeThenableChain([rowWithArrayCat])
    mockClient(chain)
    const result = await getAdminCourses({ status: 'all' })
    expect(result[0].category_name).toBe('AI配列')
  })

  it('DB エラー → [] + console.error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const chain = makeThenableChain(null, { code: 'PGRST301', message: 'error' })
    mockClient(chain)
    const result = await getAdminCourses()
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

// ----------------------------------------------------------------
// getAdminCategories
// ----------------------------------------------------------------
describe('getAdminCategories', () => {
  it('正常系：カテゴリ一覧を返す', async () => {
    const cats = [
      { id: 'cat-001', name: 'AI基礎' },
      { id: 'cat-002', name: '応用' },
    ]
    const chain = makeIsChain(cats)
    const from = vi.fn(() => chain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    const result = await getAdminCategories()
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('AI基礎')
  })

  it('DB エラー → [] + console.error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const chain = makeIsChain(null, { code: 'PGRST301', message: 'error' })
    const from = vi.fn(() => chain)
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    const result = await getAdminCategories()
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
