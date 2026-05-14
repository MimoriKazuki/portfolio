import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { getFeaturedCourses, getFeaturedContents } from '../get-lp-data'

// ----------------------------------------------------------------
// チェーンスタブ ビルダー
// ----------------------------------------------------------------

// .select().eq().is().eq().order().limit() → { data, error }
function makeListChain(data: unknown[], error: unknown = null) {
  const result = { data, error }
  const limit = vi.fn().mockResolvedValue(result)
  const order = vi.fn(() => ({ limit }))
  const eq2 = vi.fn(() => ({ order }))
  const is = vi.fn(() => ({ eq: eq2 }))
  const eq1 = vi.fn(() => ({ is }))
  const select = vi.fn(() => ({ eq: eq1 }))
  return { select, _eq1: eq1, _is: is, _eq2: eq2, _order: order, _limit: limit }
}

function mockClient(stub: ReturnType<typeof makeListChain>) {
  const from = vi.fn(() => stub)
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { from }
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// getFeaturedCourses
// ----------------------------------------------------------------
describe('getFeaturedCourses', () => {
  const courses = [
    { id: 'c-1', slug: 'intro-ai', title: 'AI 入門', description: 'desc', thumbnail_url: null, is_free: false, price: 9800 },
    { id: 'c-2', slug: 'llm-basics', title: 'LLM 基礎', description: null, thumbnail_url: 'https://example.com/thumb.jpg', is_free: true, price: null },
  ]

  it('正常系：取得件数分の配列を返す', async () => {
    const stub = makeListChain(courses)
    mockClient(stub)
    const result = await getFeaturedCourses()
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('c-1')
    expect(result[1].slug).toBe('llm-basics')
  })

  it('eq("is_published", true) が呼ばれる', async () => {
    const stub = makeListChain(courses)
    mockClient(stub)
    await getFeaturedCourses()
    expect(stub._eq1).toHaveBeenCalledWith('is_published', true)
  })

  it('is("deleted_at", null) が呼ばれる', async () => {
    const stub = makeListChain(courses)
    mockClient(stub)
    await getFeaturedCourses()
    expect(stub._is).toHaveBeenCalledWith('deleted_at', null)
  })

  it('eq("is_featured", true) が呼ばれる', async () => {
    const stub = makeListChain(courses)
    mockClient(stub)
    await getFeaturedCourses()
    expect(stub._eq2).toHaveBeenCalledWith('is_featured', true)
  })

  it('limit パラメータがデフォルト 3 で limit() に渡る', async () => {
    const stub = makeListChain(courses)
    mockClient(stub)
    await getFeaturedCourses()
    expect(stub._limit).toHaveBeenCalledWith(3)
  })

  it('limit パラメータを明示指定すると limit() に渡る', async () => {
    const stub = makeListChain(courses)
    mockClient(stub)
    await getFeaturedCourses(5)
    expect(stub._limit).toHaveBeenCalledWith(5)
  })

  it('空配列：エラーなしで [] を返す', async () => {
    const stub = makeListChain([])
    mockClient(stub)
    const result = await getFeaturedCourses()
    expect(result).toEqual([])
  })

  it('DB エラー：console.error を呼び [] にフォールバック（throw しない）', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const stub = makeListChain([], { code: 'PGRST301', message: 'db error' })
    mockClient(stub)
    const result = await getFeaturedCourses()
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

// ----------------------------------------------------------------
// getFeaturedContents
// ----------------------------------------------------------------
describe('getFeaturedContents', () => {
  const contents = [
    { id: 'ct-1', title: 'ChatGPT 活用術', description: 'desc', thumbnail_url: null, duration: '30分', is_free: false, price: 4900 },
    { id: 'ct-2', title: 'プロンプト入門', description: null, thumbnail_url: null, duration: null, is_free: true, price: null },
  ]

  it('正常系：取得件数分の配列を返す', async () => {
    const stub = makeListChain(contents)
    mockClient(stub)
    const result = await getFeaturedContents()
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('ct-1')
    expect(result[1].title).toBe('プロンプト入門')
  })

  it('eq("is_published", true) が呼ばれる', async () => {
    const stub = makeListChain(contents)
    mockClient(stub)
    await getFeaturedContents()
    expect(stub._eq1).toHaveBeenCalledWith('is_published', true)
  })

  it('is("deleted_at", null) が呼ばれる', async () => {
    const stub = makeListChain(contents)
    mockClient(stub)
    await getFeaturedContents()
    expect(stub._is).toHaveBeenCalledWith('deleted_at', null)
  })

  it('eq("is_featured", true) が呼ばれる', async () => {
    const stub = makeListChain(contents)
    mockClient(stub)
    await getFeaturedContents()
    expect(stub._eq2).toHaveBeenCalledWith('is_featured', true)
  })

  it('limit パラメータがデフォルト 4 で limit() に渡る', async () => {
    const stub = makeListChain(contents)
    mockClient(stub)
    await getFeaturedContents()
    expect(stub._limit).toHaveBeenCalledWith(4)
  })

  it('limit パラメータを明示指定すると limit() に渡る', async () => {
    const stub = makeListChain(contents)
    mockClient(stub)
    await getFeaturedContents(6)
    expect(stub._limit).toHaveBeenCalledWith(6)
  })

  it('空配列：エラーなしで [] を返す', async () => {
    const stub = makeListChain([])
    mockClient(stub)
    const result = await getFeaturedContents()
    expect(result).toEqual([])
  })

  it('DB エラー：console.error を呼び [] にフォールバック（throw しない）', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const stub = makeListChain([], { code: 'PGRST301', message: 'db error' })
    mockClient(stub)
    const result = await getFeaturedContents()
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
