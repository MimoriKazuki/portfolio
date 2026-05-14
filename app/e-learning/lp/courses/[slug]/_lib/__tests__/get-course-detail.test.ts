import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { getCourseDetailBySlug } from '../get-course-detail'

// ----------------------------------------------------------------
// チェーンスタブ ビルダー
// ----------------------------------------------------------------

// courses クエリ：.select().eq().eq().is().maybeSingle() → { data, error }
function makeCourseChain(data: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error })
  const is = vi.fn(() => ({ maybeSingle }))
  const eq2 = vi.fn(() => ({ is }))
  const eq1 = vi.fn(() => ({ eq: eq2 }))
  const select = vi.fn(() => ({ eq: eq1 }))
  return { select, _eq1: eq1, _eq2: eq2, _is: is, _maybeSingle: maybeSingle }
}

// materials クエリ：.select().eq().order() → { data, error }
function makeMaterialsChain(data: unknown[], error: unknown = null) {
  const result = { data, error }
  const order = vi.fn().mockResolvedValue(result)
  const eq = vi.fn(() => ({ order }))
  const select = vi.fn(() => ({ eq }))
  return { select, _order: order }
}

function mockClient(
  courseStub: ReturnType<typeof makeCourseChain>,
  materialsStub: ReturnType<typeof makeMaterialsChain>,
) {
  const callCounts: Record<string, number> = {}
  const from = vi.fn((name: string) => {
    if (name === 'e_learning_courses') return courseStub
    if (name === 'e_learning_materials') return materialsStub
    return {}
  })
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { from }
}

// ----------------------------------------------------------------
// テストデータ
// ----------------------------------------------------------------

const rawChapters = [
  {
    id: 'ch-2', title: '第2章', description: null, display_order: 2,
    videos: [
      { id: 'v-3', title: '動画3', description: null, duration: '10分', is_free: false, display_order: 2 },
      { id: 'v-2', title: '動画2', description: null, duration: '5分', is_free: true, display_order: 1 },
    ],
  },
  {
    id: 'ch-1', title: '第1章', description: null, display_order: 1,
    videos: [
      { id: 'v-1', title: '動画1', description: null, duration: '8分', is_free: false, display_order: 1 },
    ],
  },
]

const rawCourse = {
  id: 'course-1', slug: 'intro-ai', title: 'AI 入門', description: 'desc',
  thumbnail_url: null, is_free: false, price: 9800,
  category_id: 'cat-1', category: { name: 'AI 基礎' },
  chapters: rawChapters,
}

const rawMaterials = [
  { id: 'mat-1', title: '資料1', file_url: 'https://example.com/mat1.pdf', file_size: 1024, display_order: 1 },
]

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// getCourseDetailBySlug
// ----------------------------------------------------------------
describe('getCourseDetailBySlug', () => {
  it('正常系：course + chapters + materials を整形して返す', async () => {
    const cStub = makeCourseChain(rawCourse)
    const mStub = makeMaterialsChain(rawMaterials)
    mockClient(cStub, mStub)

    const result = await getCourseDetailBySlug('intro-ai')
    expect(result).not.toBeNull()
    expect(result!.id).toBe('course-1')
    expect(result!.title).toBe('AI 入門')
    expect(result!.materials).toHaveLength(1)
    expect(result!.chapters).toHaveLength(2)
  })

  it('章が display_order 昇順でソートされる', async () => {
    const cStub = makeCourseChain(rawCourse)
    const mStub = makeMaterialsChain([])
    mockClient(cStub, mStub)

    const result = await getCourseDetailBySlug('intro-ai')
    expect(result!.chapters[0].id).toBe('ch-1')  // display_order 1
    expect(result!.chapters[1].id).toBe('ch-2')  // display_order 2
  })

  it('各章内の動画が display_order 昇順でソートされる', async () => {
    const cStub = makeCourseChain(rawCourse)
    const mStub = makeMaterialsChain([])
    mockClient(cStub, mStub)

    const result = await getCourseDetailBySlug('intro-ai')
    const ch2 = result!.chapters.find(c => c.id === 'ch-2')!
    expect(ch2.videos[0].id).toBe('v-2')   // display_order 1
    expect(ch2.videos[1].id).toBe('v-3')   // display_order 2
  })

  it('category が配列形式で返っても category_name を正規化する', async () => {
    const courseWithArrayCat = { ...rawCourse, category: [{ name: 'AI 基礎' }] }
    const cStub = makeCourseChain(courseWithArrayCat)
    const mStub = makeMaterialsChain([])
    mockClient(cStub, mStub)

    const result = await getCourseDetailBySlug('intro-ai')
    expect(result!.category_name).toBe('AI 基礎')
  })

  it('course が null（存在しない slug）→ null 返却', async () => {
    const cStub = makeCourseChain(null)
    const mStub = makeMaterialsChain([])
    mockClient(cStub, mStub)

    const result = await getCourseDetailBySlug('nonexistent')
    expect(result).toBeNull()
  })

  it('eq("is_published", true) が呼ばれる（未公開フィルタ確認）', async () => {
    const cStub = makeCourseChain(rawCourse)
    const mStub = makeMaterialsChain([])
    mockClient(cStub, mStub)

    await getCourseDetailBySlug('intro-ai')
    expect(cStub._eq2).toHaveBeenCalledWith('is_published', true)
  })

  it('is("deleted_at", null) が呼ばれる（論理削除フィルタ確認）', async () => {
    const cStub = makeCourseChain(rawCourse)
    const mStub = makeMaterialsChain([])
    mockClient(cStub, mStub)

    await getCourseDetailBySlug('intro-ai')
    expect(cStub._is).toHaveBeenCalledWith('deleted_at', null)
  })

  it('courses DB エラー → console.error + null 返却', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const cStub = makeCourseChain(null, { code: 'PGRST301', message: 'db error' })
    const mStub = makeMaterialsChain([])
    mockClient(cStub, mStub)

    const result = await getCourseDetailBySlug('intro-ai')
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('materials DB エラーでも course 情報は返る（materials は空配列）', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const cStub = makeCourseChain(rawCourse)
    const mStub = makeMaterialsChain([], { code: 'PGRST301', message: 'db error' })
    mockClient(cStub, mStub)

    const result = await getCourseDetailBySlug('intro-ai')
    expect(result).not.toBeNull()
    expect(result!.materials).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
