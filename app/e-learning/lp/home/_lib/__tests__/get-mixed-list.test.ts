import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * getMixedList のユニットテスト（unittest-mate 指示）
 *
 * 観点：
 * - filters 未指定で courses + contents 両方を取得して結合
 * - types フィルタで片方のみ取得（fetch がスキップされる）
 * - is_featured 降順 → created_at 降順のソート順
 * - keyword の % _ ILIKE エスケープ（or() 呼び出し検証）
 * - 片系統 DB エラー時の fallback（[] で継続）
 */

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { getMixedList } from '../get-mixed-list'

// ----------------------------------------------------------------
// チェーンスタブ：courses / contents の SELECT 系
// .select().eq().is().in()/eq()/or() → thenable
// ----------------------------------------------------------------
function makeQueryChain(data: unknown[], error: unknown = null) {
  const result = { data, error }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {
    then: (resolve: (v: typeof result) => void) => Promise.resolve(result).then(resolve),
    catch: (reject: (e: unknown) => void) => Promise.resolve(result).catch(reject),
    in: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    or: vi.fn(() => chain),
    is: vi.fn(() => chain),
    order: vi.fn(() => chain),
  }
  const select = vi.fn(() => chain)
  return { select, chain }
}

function mockClient(stubs: Record<string, { select: ReturnType<typeof vi.fn> }>) {
  const from = vi.fn((name: string) => stubs[name] ?? {})
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { from }
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// フィクスチャ
// ----------------------------------------------------------------
const rawCourses = [
  {
    id: 'course-1', slug: 'intro', title: 'AI 入門', description: 'コース',
    thumbnail_url: null, is_free: true, price: null, is_featured: true,
    category_id: 'cat-1', created_at: '2026-05-10T00:00:00Z',
    category: { name: 'AI 基礎' },
  },
  {
    id: 'course-2', slug: 'claude', title: 'Claude 実践', description: null,
    thumbnail_url: null, is_free: false, price: 9800, is_featured: false,
    category_id: 'cat-2', created_at: '2026-05-12T00:00:00Z',
    category: [{ name: 'LLM' }],
  },
]

const rawContents = [
  {
    id: 'content-1', title: '単体動画 A', description: '動画',
    thumbnail_url: null, is_free: false, price: 980, is_featured: true,
    duration: '12:34', category_id: 'cat-1', created_at: '2026-05-11T00:00:00Z',
    category: { name: 'AI 基礎' },
  },
  {
    id: 'content-2', title: '単体動画 B', description: null,
    thumbnail_url: null, is_free: true, price: null, is_featured: false,
    duration: '05:00', category_id: 'cat-2', created_at: '2026-05-13T00:00:00Z',
    category: null,
  },
]

// ----------------------------------------------------------------
// テスト
// ----------------------------------------------------------------
describe('getMixedList', () => {
  it('filters 未指定 → courses + contents 両方取得して結合した結果を返す', async () => {
    mockClient({
      e_learning_courses: makeQueryChain(rawCourses),
      e_learning_contents: makeQueryChain(rawContents),
    })
    const result = await getMixedList()
    expect(result).toHaveLength(4)
    // 各レコードに type と key が付与されていることを確認
    const courseItems = result.filter(r => r.type === 'course')
    const contentItems = result.filter(r => r.type === 'content')
    expect(courseItems).toHaveLength(2)
    expect(contentItems).toHaveLength(2)
    expect(courseItems[0].key.startsWith('course:')).toBe(true)
    expect(contentItems[0].key.startsWith('content:')).toBe(true)
  })

  it('types=["course"] → e_learning_contents の SELECT が呼ばれない', async () => {
    const coursesStub = makeQueryChain(rawCourses)
    const contentsStub = makeQueryChain(rawContents)
    mockClient({
      e_learning_courses: coursesStub,
      e_learning_contents: contentsStub,
    })
    const result = await getMixedList({ types: ['course'] })
    expect(coursesStub.select).toHaveBeenCalled()
    expect(contentsStub.select).not.toHaveBeenCalled()
    expect(result.every(r => r.type === 'course')).toBe(true)
  })

  it('types=["content"] → e_learning_courses の SELECT が呼ばれない', async () => {
    const coursesStub = makeQueryChain(rawCourses)
    const contentsStub = makeQueryChain(rawContents)
    mockClient({
      e_learning_courses: coursesStub,
      e_learning_contents: contentsStub,
    })
    const result = await getMixedList({ types: ['content'] })
    expect(coursesStub.select).not.toHaveBeenCalled()
    expect(contentsStub.select).toHaveBeenCalled()
    expect(result.every(r => r.type === 'content')).toBe(true)
  })

  it('is_featured=true のアイテムが降順で先頭に来る（ソート検証）', async () => {
    mockClient({
      e_learning_courses: makeQueryChain(rawCourses),
      e_learning_contents: makeQueryChain(rawContents),
    })
    const result = await getMixedList()
    // 最初の 2 件は is_featured=true（course-1 と content-1）
    expect(result[0].is_featured).toBe(true)
    expect(result[1].is_featured).toBe(true)
    expect(result[2].is_featured).toBe(false)
    expect(result[3].is_featured).toBe(false)
  })

  it('同一 is_featured 内では created_at 降順になる（ソート検証）', async () => {
    mockClient({
      e_learning_courses: makeQueryChain(rawCourses),
      e_learning_contents: makeQueryChain(rawContents),
    })
    const result = await getMixedList()
    // is_featured=true 同士：content-1 (2026-05-11) vs course-1 (2026-05-10)
    // → content-1 が先（より新しい）
    expect(result[0].id).toBe('content-1')
    expect(result[1].id).toBe('course-1')
    // is_featured=false 同士：content-2 (2026-05-13) vs course-2 (2026-05-12)
    // → content-2 が先
    expect(result[2].id).toBe('content-2')
    expect(result[3].id).toBe('course-2')
  })

  it('courses の DB エラー → courses 分が [] でフォールバック・contents は正常返却', async () => {
    mockClient({
      e_learning_courses: makeQueryChain([], { code: 'PGRST123', message: 'down' }),
      e_learning_contents: makeQueryChain(rawContents),
    })
    const result = await getMixedList()
    expect(result.every(r => r.type === 'content')).toBe(true)
    expect(result).toHaveLength(2)
  })

  it('keyword の % _ が ILIKE エスケープされる（両テーブル）', async () => {
    const coursesStub = makeQueryChain([])
    const contentsStub = makeQueryChain([])
    mockClient({
      e_learning_courses: coursesStub,
      e_learning_contents: contentsStub,
    })
    await getMixedList({ keyword: '50% _off' })

    // 両テーブルの .or() に escape された値が渡されていることを確認
    expect(coursesStub.chain.or).toHaveBeenCalledWith(
      expect.stringContaining('50\\% \\_off'),
    )
    expect(contentsStub.chain.or).toHaveBeenCalledWith(
      expect.stringContaining('50\\% \\_off'),
    )
  })
})
