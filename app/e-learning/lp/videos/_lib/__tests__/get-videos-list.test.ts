import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { getVideosList } from '../get-videos-list'

// ----------------------------------------------------------------
// チェーンスタブ ビルダー
// ----------------------------------------------------------------

/**
 * getVideosList 用チェーンスタブ。
 * .select().eq().is().order() → thenable（フィルタ追加時は .in()/.eq()/.or() が連鎖）
 */
function makeVideosQueryChain(data: unknown[], error: unknown = null) {
  const result = { data, error }
  const chain: any = {
    then: (resolve: (v: typeof result) => void) => Promise.resolve(result).then(resolve),
    catch: (reject: (e: unknown) => void) => Promise.resolve(result).catch(reject),
    in: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    or: vi.fn(() => chain),
    order: vi.fn(() => chain),
    is: vi.fn(() => chain),
  }
  const select = vi.fn(() => chain)
  return { select, chain }
}

function mockClient(stub: ReturnType<typeof makeVideosQueryChain>) {
  const from = vi.fn(() => stub)
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { from }
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// getVideosList
// ----------------------------------------------------------------
describe('getVideosList', () => {
  const rawVideos = [
    {
      id: 'v-1', title: 'ChatGPT 活用術', description: 'desc',
      thumbnail_url: null, duration: '30分', is_free: false, price: 4900,
      category_id: 'cat-1', category: { name: 'AI 基礎' },
    },
    {
      id: 'v-2', title: 'プロンプト入門', description: null,
      thumbnail_url: null, duration: null, is_free: true, price: null,
      category_id: 'cat-2', category: [{ name: 'LLM' }],  // 配列形式のケース
    },
  ]

  it('正常系：取得件数分・category_name を解決して返す', async () => {
    const stub = makeVideosQueryChain(rawVideos)
    mockClient(stub)
    const result = await getVideosList()
    expect(result).toHaveLength(2)
    expect(result[0].category_name).toBe('AI 基礎')
    expect(result[1].category_name).toBe('LLM')   // 配列形式でも正しく解決
  })

  it('eq("is_published", true) が呼ばれる', async () => {
    const stub = makeVideosQueryChain(rawVideos)
    mockClient(stub)
    await getVideosList()
    expect(stub.chain.eq).toHaveBeenCalledWith('is_published', true)
  })

  it('is("deleted_at", null) が呼ばれる', async () => {
    const stub = makeVideosQueryChain(rawVideos)
    mockClient(stub)
    await getVideosList()
    expect(stub.chain.is).toHaveBeenCalledWith('deleted_at', null)
  })

  it('空配列：エラーなしで [] を返す', async () => {
    const stub = makeVideosQueryChain([])
    mockClient(stub)
    const result = await getVideosList()
    expect(result).toEqual([])
  })

  it('DB エラー：console.error を呼び [] フォールバック', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const stub = makeVideosQueryChain([], { code: 'PGRST301', message: 'db error' })
    mockClient(stub)
    const result = await getVideosList()
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('categoryIds フィルタ：in("category_id", [...]) が呼ばれる', async () => {
    const stub = makeVideosQueryChain(rawVideos)
    mockClient(stub)
    await getVideosList({ categoryIds: ['cat-1', 'cat-2'] })
    expect(stub.chain.in).toHaveBeenCalledWith('category_id', ['cat-1', 'cat-2'])
  })

  it('categoryIds が空配列のとき in() は呼ばれない', async () => {
    const stub = makeVideosQueryChain(rawVideos)
    mockClient(stub)
    await getVideosList({ categoryIds: [] })
    expect(stub.chain.in).not.toHaveBeenCalled()
  })

  it('freeFilter="free" → eq("is_free", true) が呼ばれる', async () => {
    const stub = makeVideosQueryChain(rawVideos)
    mockClient(stub)
    await getVideosList({ freeFilter: 'free' })
    expect(stub.chain.eq).toHaveBeenCalledWith('is_free', true)
  })

  it('freeFilter="paid" → eq("is_free", false) が呼ばれる', async () => {
    const stub = makeVideosQueryChain(rawVideos)
    mockClient(stub)
    await getVideosList({ freeFilter: 'paid' })
    expect(stub.chain.eq).toHaveBeenCalledWith('is_free', false)
  })

  it('freeFilter="all" のとき is_free の eq は呼ばれない', async () => {
    const stub = makeVideosQueryChain(rawVideos)
    mockClient(stub)
    await getVideosList({ freeFilter: 'all' })
    const eqCalls = (stub.chain.eq as ReturnType<typeof vi.fn>).mock.calls
    expect(eqCalls.some((c: unknown[]) => c[0] === 'is_free')).toBe(false)
  })

  it('keyword フィルタ：or(ilike パターン) が呼ばれる', async () => {
    const stub = makeVideosQueryChain(rawVideos)
    mockClient(stub)
    await getVideosList({ keyword: 'プロンプト' })
    expect(stub.chain.or).toHaveBeenCalledWith(
      expect.stringContaining('title.ilike.%プロンプト%'),
    )
  })

  it('keyword の % _ が ILIKE エスケープされる', async () => {
    const stub = makeVideosQueryChain([])
    mockClient(stub)
    await getVideosList({ keyword: '50%off_sale' })
    const orArg = (stub.chain.or as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(orArg).toContain('50\\%off\\_sale')
  })

  it('keyword が空文字のとき or() は呼ばれない', async () => {
    const stub = makeVideosQueryChain(rawVideos)
    mockClient(stub)
    await getVideosList({ keyword: '   ' })
    expect(stub.chain.or).not.toHaveBeenCalled()
  })
})
