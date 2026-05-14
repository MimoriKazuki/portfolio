import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { getCoursesList, getActiveCategories } from '../get-courses-list'

// ----------------------------------------------------------------
// チェーンスタブ ビルダー
// ----------------------------------------------------------------

/**
 * getCoursesList 用チェーンスタブ。
 *
 * ベースクエリ：.select().eq().is().order() → thenable（フィルタなし時はここで await）
 * 条件付きフィルタ：.in() / .eq() / .or() がさらに連鎖して await
 *
 * すべてのメソッドが同じ thenable オブジェクトを返すことで、
 * どの組み合わせで await されても data/error を解決できる。
 */
function makeCoursesQueryChain(data: unknown[], error: unknown = null) {
  const result = { data, error }

  // thenable かつすべてのフィルタメソッドを持つオブジェクト
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

/**
 * getActiveCategories 用チェーンスタブ。
 * .select().eq().is().order() → thenable（limit なし）
 */
function makeCategoriesQueryChain(data: unknown[], error: unknown = null) {
  const result = { data, error }
  const chain: any = {
    then: (resolve: (v: typeof result) => void) => Promise.resolve(result).then(resolve),
    catch: (reject: (e: unknown) => void) => Promise.resolve(result).catch(reject),
    eq: vi.fn(() => chain),
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
// getCoursesList
// ----------------------------------------------------------------
describe('getCoursesList', () => {
  const rawCourses = [
    {
      id: 'c-1', slug: 'intro-ai', title: 'AI 入門', description: 'desc',
      thumbnail_url: null, is_free: false, price: 9800,
      category_id: 'cat-1', category: { name: 'AI 基礎' },
    },
    {
      id: 'c-2', slug: 'llm', title: 'LLM 基礎', description: null,
      thumbnail_url: null, is_free: true, price: null,
      category_id: 'cat-2', category: [{ name: 'LLM' }],  // 配列形式のケース
    },
  ]

  it('正常系：取得件数分・category_name を解決して返す', async () => {
    const stub = makeCoursesQueryChain(rawCourses)
    mockClient({ e_learning_courses: stub })
    const result = await getCoursesList()
    expect(result).toHaveLength(2)
    expect(result[0].category_name).toBe('AI 基礎')
    expect(result[1].category_name).toBe('LLM')   // 配列形式でも正しく解決
  })

  it('eq("is_published", true) が呼ばれる', async () => {
    const stub = makeCoursesQueryChain(rawCourses)
    mockClient({ e_learning_courses: stub })
    await getCoursesList()
    expect(stub.chain.eq).toHaveBeenCalledWith('is_published', true)
  })

  it('is("deleted_at", null) が呼ばれる', async () => {
    const stub = makeCoursesQueryChain(rawCourses)
    mockClient({ e_learning_courses: stub })
    await getCoursesList()
    expect(stub.chain.is).toHaveBeenCalledWith('deleted_at', null)
  })

  it('空配列：エラーなしで [] を返す', async () => {
    const stub = makeCoursesQueryChain([])
    mockClient({ e_learning_courses: stub })
    const result = await getCoursesList()
    expect(result).toEqual([])
  })

  it('DB エラー：console.error を呼び [] フォールバック', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const stub = makeCoursesQueryChain([], { code: 'PGRST301', message: 'db error' })
    mockClient({ e_learning_courses: stub })
    const result = await getCoursesList()
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('categoryIds フィルタ：in("category_id", [...]) が呼ばれる', async () => {
    const stub = makeCoursesQueryChain(rawCourses)
    mockClient({ e_learning_courses: stub })
    await getCoursesList({ categoryIds: ['cat-1', 'cat-2'] })
    expect(stub.chain.in).toHaveBeenCalledWith('category_id', ['cat-1', 'cat-2'])
  })

  it('categoryIds が空配列のとき in() は呼ばれない', async () => {
    const stub = makeCoursesQueryChain(rawCourses)
    mockClient({ e_learning_courses: stub })
    await getCoursesList({ categoryIds: [] })
    expect(stub.chain.in).not.toHaveBeenCalled()
  })

  it('freeFilter="free" → eq("is_free", true) が呼ばれる', async () => {
    const stub = makeCoursesQueryChain(rawCourses)
    mockClient({ e_learning_courses: stub })
    await getCoursesList({ freeFilter: 'free' })
    expect(stub.chain.eq).toHaveBeenCalledWith('is_free', true)
  })

  it('freeFilter="paid" → eq("is_free", false) が呼ばれる', async () => {
    const stub = makeCoursesQueryChain(rawCourses)
    mockClient({ e_learning_courses: stub })
    await getCoursesList({ freeFilter: 'paid' })
    expect(stub.chain.eq).toHaveBeenCalledWith('is_free', false)
  })

  it('freeFilter="all" のとき is_free の eq は呼ばれない', async () => {
    const stub = makeCoursesQueryChain(rawCourses)
    mockClient({ e_learning_courses: stub })
    await getCoursesList({ freeFilter: 'all' })
    // is_published=true の eq は呼ばれるが is_free 系は呼ばれない
    const eqCalls = (stub.chain.eq as ReturnType<typeof vi.fn>).mock.calls
    expect(eqCalls.some((c: unknown[]) => c[0] === 'is_free')).toBe(false)
  })

  it('keyword フィルタ：or(ilike パターン) が呼ばれる', async () => {
    const stub = makeCoursesQueryChain(rawCourses)
    mockClient({ e_learning_courses: stub })
    await getCoursesList({ keyword: 'AI' })
    expect(stub.chain.or).toHaveBeenCalledWith(
      expect.stringContaining('title.ilike.%AI%'),
    )
  })

  it('keyword の % _ が ILIKE エスケープされる', async () => {
    const stub = makeCoursesQueryChain([])
    mockClient({ e_learning_courses: stub })
    await getCoursesList({ keyword: '100%割引_test' })
    const orArg = (stub.chain.or as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(orArg).toContain('100\\%割引\\_test')
  })

  it('keyword が空文字のとき or() は呼ばれない', async () => {
    const stub = makeCoursesQueryChain(rawCourses)
    mockClient({ e_learning_courses: stub })
    await getCoursesList({ keyword: '   ' })
    expect(stub.chain.or).not.toHaveBeenCalled()
  })
})

// ----------------------------------------------------------------
// getActiveCategories
// ----------------------------------------------------------------
describe('getActiveCategories', () => {
  const categories = [
    { id: 'cat-1', name: 'AI 基礎', slug: 'ai-basics' },
    { id: 'cat-2', name: 'LLM', slug: 'llm' },
  ]

  it('正常系：カテゴリ配列を返す', async () => {
    const stub = makeCategoriesQueryChain(categories)
    mockClient({ e_learning_categories: stub })
    const result = await getActiveCategories()
    expect(result).toHaveLength(2)
    expect(result[0].slug).toBe('ai-basics')
  })

  it('eq("is_active", true) が呼ばれる', async () => {
    const stub = makeCategoriesQueryChain(categories)
    mockClient({ e_learning_categories: stub })
    await getActiveCategories()
    expect(stub.chain.eq).toHaveBeenCalledWith('is_active', true)
  })

  it('is("deleted_at", null) が呼ばれる', async () => {
    const stub = makeCategoriesQueryChain(categories)
    mockClient({ e_learning_categories: stub })
    await getActiveCategories()
    expect(stub.chain.is).toHaveBeenCalledWith('deleted_at', null)
  })

  it('order("display_order", {ascending:true}) が呼ばれる', async () => {
    const stub = makeCategoriesQueryChain(categories)
    mockClient({ e_learning_categories: stub })
    await getActiveCategories()
    expect(stub.chain.order).toHaveBeenCalledWith('display_order', { ascending: true })
  })

  it('空配列：エラーなしで [] を返す', async () => {
    const stub = makeCategoriesQueryChain([])
    mockClient({ e_learning_categories: stub })
    const result = await getActiveCategories()
    expect(result).toEqual([])
  })

  it('DB エラー：console.error を呼び [] フォールバック', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const stub = makeCategoriesQueryChain([], { code: 'PGRST301', message: 'db error' })
    mockClient({ e_learning_categories: stub })
    const result = await getActiveCategories()
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
