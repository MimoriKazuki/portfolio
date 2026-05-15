import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/app/lib/services/bookmark-service', () => ({
  list: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { list as listBookmarks } from '@/app/lib/services/bookmark-service'
import { getMyLearning, getActiveCategoriesForMyLearning } from '../get-my-learning'

// ----------------------------------------------------------------
// チェーンスタブ ビルダー
// ----------------------------------------------------------------

// purchased 取得用：.select().eq('user_id').eq('status').order() → { data, error }
function makePurchasedChain(data: unknown[], error: unknown = null) {
  const result = { data, error }
  const order = vi.fn().mockResolvedValue(result)
  const eq2 = vi.fn(() => ({ order }))
  const eq1 = vi.fn(() => ({ eq: eq2 }))
  const select = vi.fn(() => ({ eq: eq1 }))
  return { select }
}

// bookmarked の courses/contents 取得用：.select().in() → { data, error }
function makeInChain(data: unknown[], error: unknown = null) {
  const result = { data, error }
  const inFn = vi.fn().mockResolvedValue(result)
  const select = vi.fn(() => ({ in: inFn }))
  return { select }
}

// getActiveCategoriesForMyLearning 用：.select().eq().order() → { data, error }
function makeCategoriesChain(data: unknown[], error: unknown = null) {
  const result = { data, error }
  const order = vi.fn().mockResolvedValue(result)
  const eq = vi.fn(() => ({ order }))
  const select = vi.fn(() => ({ eq }))
  return { select }
}

function mockClientForPurchased(stub: ReturnType<typeof makePurchasedChain>) {
  const from = vi.fn(() => stub)
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { from }
}

function mockClientForBookmarked(
  coursesStub: ReturnType<typeof makeInChain>,
  contentsStub: ReturnType<typeof makeInChain>,
) {
  const from = vi.fn((table: string) => {
    if (table === 'e_learning_courses') return coursesStub
    if (table === 'e_learning_contents') return contentsStub
    return {}
  })
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { from }
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// テストフィクスチャ
// ----------------------------------------------------------------

const completedCoursePurchase = {
  id: 'pur-1',
  course_id: 'course-1',
  content_id: null,
  course: {
    id: 'course-1',
    title: 'AI 入門',
    slug: 'intro-ai',
    thumbnail_url: 'https://example.com/thumb.jpg',
    description: 'AI の基礎',
    is_published: true,
    deleted_at: null,
    category_id: 'cat-1',
    is_free: false,
    price: 9800,
    category: { id: 'cat-1', name: 'AI 基礎' },
  },
  content: null,
}

const completedContentPurchase = {
  id: 'pur-2',
  course_id: null,
  content_id: 'content-1',
  course: null,
  content: {
    id: 'content-1',
    title: 'ChatGPT 活用術',
    thumbnail_url: null,
    description: null,
    is_published: true,
    deleted_at: null,
    category_id: 'cat-2',
    is_free: true,
    price: null,
    category: { id: 'cat-2', name: 'LLM' },
  },
}

// ----------------------------------------------------------------
// getMyLearning — tab='purchased'
// ----------------------------------------------------------------
describe('getMyLearning — tab=purchased', () => {
  it('completed の course / content 両方を返す', async () => {
    mockClientForPurchased(
      makePurchasedChain([completedCoursePurchase, completedContentPurchase]),
    )
    const result = await getMyLearning('eu-1', { tab: 'purchased' })
    expect(result).toHaveLength(2)
    expect(result[0].type).toBe('course')
    expect(result[0].key).toBe('course:course-1')
    expect(result[0].title).toBe('AI 入門')
    expect(result[1].type).toBe('content')
    expect(result[1].key).toBe('content:content-1')
  })

  it('is_published=false のコースを除外する', async () => {
    const unpublished = {
      ...completedCoursePurchase,
      course: { ...completedCoursePurchase.course, is_published: false },
    }
    mockClientForPurchased(makePurchasedChain([unpublished]))
    const result = await getMyLearning('eu-1', { tab: 'purchased' })
    expect(result).toHaveLength(0)
  })

  it('deleted_at IS NOT NULL のコースを除外する', async () => {
    const deleted = {
      ...completedCoursePurchase,
      course: { ...completedCoursePurchase.course, deleted_at: '2026-01-01T00:00:00Z' },
    }
    mockClientForPurchased(makePurchasedChain([deleted]))
    const result = await getMyLearning('eu-1', { tab: 'purchased' })
    expect(result).toHaveLength(0)
  })

  it('types=["course"] のとき content を含まない', async () => {
    mockClientForPurchased(
      makePurchasedChain([completedCoursePurchase, completedContentPurchase]),
    )
    const result = await getMyLearning('eu-1', { tab: 'purchased', types: ['course'] })
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('course')
  })

  it('types=["content"] のとき course を含まない', async () => {
    mockClientForPurchased(
      makePurchasedChain([completedCoursePurchase, completedContentPurchase]),
    )
    const result = await getMyLearning('eu-1', { tab: 'purchased', types: ['content'] })
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('content')
  })

  it('categoryIds 指定で他カテゴリのアイテムを除外する', async () => {
    mockClientForPurchased(
      makePurchasedChain([completedCoursePurchase, completedContentPurchase]),
    )
    // cat-1 のみ指定 → course のみ残る
    const result = await getMyLearning('eu-1', { tab: 'purchased', categoryIds: ['cat-1'] })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('course-1')
  })

  it('DB エラー → 空配列フォールバック', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockClientForPurchased(makePurchasedChain([], { code: 'PGRST301', message: 'db error' }))
    const result = await getMyLearning('eu-1', { tab: 'purchased' })
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('category が配列形式でも category_name を正しく解決する', async () => {
    const arrayJoin = {
      ...completedCoursePurchase,
      course: {
        ...completedCoursePurchase.course,
        category: [{ id: 'cat-1', name: 'AI 基礎（配列）' }],
      },
    }
    mockClientForPurchased(makePurchasedChain([arrayJoin]))
    const result = await getMyLearning('eu-1', { tab: 'purchased' })
    expect(result[0].category_name).toBe('AI 基礎（配列）')
  })
})

// ----------------------------------------------------------------
// getMyLearning — tab='bookmarked'
// ----------------------------------------------------------------

const bookmarkRecords = [
  { id: 'bm-1', user_id: 'eu-1', course_id: 'course-1', content_id: null, created_at: '2026-05-01T00:00:00Z' },
  { id: 'bm-2', user_id: 'eu-1', course_id: null, content_id: 'content-1', created_at: '2026-05-02T00:00:00Z' },
]

const bookmarkedCourse = {
  id: 'course-1',
  title: 'AI 入門',
  slug: 'intro-ai',
  thumbnail_url: null,
  description: null,
  is_published: true,
  deleted_at: null,
  category_id: 'cat-1',
  is_free: false,
  price: 9800,
  category: { id: 'cat-1', name: 'AI 基礎' },
}

const bookmarkedContent = {
  id: 'content-1',
  title: 'ChatGPT 活用術',
  thumbnail_url: null,
  description: null,
  is_published: true,
  deleted_at: null,
  category_id: 'cat-2',
  is_free: true,
  price: null,
  category: { id: 'cat-2', name: 'LLM' },
}

describe('getMyLearning — tab=bookmarked', () => {
  it('bookmark-service.list の結果から course / content を両方返す', async () => {
    ;(listBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue(bookmarkRecords)
    mockClientForBookmarked(
      makeInChain([bookmarkedCourse]),
      makeInChain([bookmarkedContent]),
    )
    const result = await getMyLearning('eu-1', { tab: 'bookmarked' })
    expect(result).toHaveLength(2)
    expect(result.find(r => r.type === 'course')?.title).toBe('AI 入門')
    expect(result.find(r => r.type === 'content')?.title).toBe('ChatGPT 活用術')
  })

  it('is_published=false のブックマーク済みコースを除外する', async () => {
    ;(listBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue([bookmarkRecords[0]])
    mockClientForBookmarked(
      makeInChain([{ ...bookmarkedCourse, is_published: false }]),
      makeInChain([]),
    )
    const result = await getMyLearning('eu-1', { tab: 'bookmarked' })
    expect(result).toHaveLength(0)
  })

  it('types=["course"] のとき content を含まない', async () => {
    ;(listBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue(bookmarkRecords)
    mockClientForBookmarked(makeInChain([bookmarkedCourse]), makeInChain([bookmarkedContent]))
    const result = await getMyLearning('eu-1', { tab: 'bookmarked', types: ['course'] })
    expect(result.every(r => r.type === 'course')).toBe(true)
  })

  it('bookmark-service.list が throw → 空配列フォールバック', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ;(listBookmarks as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('service down'))
    const result = await getMyLearning('eu-1', { tab: 'bookmarked' })
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('ブックマークが空のとき Supabase を呼ばずに空配列を返す', async () => {
    ;(listBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue([])
    const from = vi.fn()
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
    const result = await getMyLearning('eu-1', { tab: 'bookmarked' })
    expect(result).toEqual([])
    // listBookmarks が空のため createClient 呼び出し自体は getBookmarkedList 内で起きるが
    // e_learning_courses / e_learning_contents への .from() は呼ばれない
    expect(from).not.toHaveBeenCalled()
  })
})

// ----------------------------------------------------------------
// getActiveCategoriesForMyLearning
// ----------------------------------------------------------------
describe('getActiveCategoriesForMyLearning', () => {
  it('カテゴリ一覧を返す', async () => {
    const cats = [{ id: 'cat-1', name: 'AI 基礎' }, { id: 'cat-2', name: 'LLM' }]
    const from = vi.fn(() => makeCategoriesChain(cats))
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
    const result = await getActiveCategoriesForMyLearning()
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('AI 基礎')
  })

  it('DB エラー → 空配列フォールバック', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const from = vi.fn(() => makeCategoriesChain([], { code: 'PGRST301' }))
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
    const result = await getActiveCategoriesForMyLearning()
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
