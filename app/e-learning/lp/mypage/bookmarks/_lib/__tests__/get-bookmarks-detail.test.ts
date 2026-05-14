import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/app/lib/services/bookmark-service', () => ({
  list: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { list as listBookmarks } from '@/app/lib/services/bookmark-service'
import { getMyBookmarksDetail } from '../get-bookmarks-detail'

// ----------------------------------------------------------------
// チェーンスタブ ビルダー
// ----------------------------------------------------------------

// .select().in() → { data, error }
function makeInChain(data: unknown[], error: unknown = null) {
  const inFn = vi.fn().mockResolvedValue({ data, error })
  const select = vi.fn(() => ({ in: inFn }))
  return { select }
}

function mockClient(
  coursesStub: ReturnType<typeof makeInChain>,
  contentsStub: ReturnType<typeof makeInChain>,
) {
  const from = vi.fn((name: string) => {
    if (name === 'e_learning_courses') return coursesStub
    if (name === 'e_learning_contents') return contentsStub
    return {}
  })
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// テストデータ
// ----------------------------------------------------------------

const courseBookmark = {
  id: 'bm-1', user_id: 'eu-1',
  course_id: 'course-1', content_id: null,
  created_at: '2026-05-01T00:00:00Z',
}
const contentBookmark = {
  id: 'bm-2', user_id: 'eu-1',
  course_id: null, content_id: 'content-1',
  created_at: '2026-05-02T00:00:00Z',
}

// ----------------------------------------------------------------
// getMyBookmarksDetail
// ----------------------------------------------------------------
describe('getMyBookmarksDetail', () => {
  it('正常系：course + content ブックマークを整形して返す', async () => {
    ;(listBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue([courseBookmark, contentBookmark])
    mockClient(
      makeInChain([{ id: 'course-1', title: 'AI 入門', slug: 'intro-ai', thumbnail_url: null }]),
      makeInChain([{ id: 'content-1', title: 'ChatGPT 活用術', thumbnail_url: null }]),
    )
    const result = await getMyBookmarksDetail('eu-1')
    expect(result).toHaveLength(2)
    const courseEntry = result.find(r => r.type === 'course')!
    expect(courseEntry.target_id).toBe('course-1')
    expect(courseEntry.title).toBe('AI 入門')
    expect(courseEntry.course_slug).toBe('intro-ai')
    const contentEntry = result.find(r => r.type === 'content')!
    expect(contentEntry.target_id).toBe('content-1')
    expect(contentEntry.title).toBe('ChatGPT 活用術')
    expect(contentEntry.course_slug).toBeNull()
  })

  it('bookmark-service.list が [] → [] 返却（createClient 呼ばれない）', async () => {
    ;(listBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue([])
    const result = await getMyBookmarksDetail('eu-1')
    expect(result).toEqual([])
    expect(createClient).not.toHaveBeenCalled()
  })

  it('bookmark-service.list が throw → catch して [] 返却 + console.error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ;(listBookmarks as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('service error'))
    const result = await getMyBookmarksDetail('eu-1')
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('course が Map に見つからない場合 title=null で返す', async () => {
    ;(listBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue([courseBookmark])
    mockClient(
      makeInChain([]),  // courses が空 = Map にない
      makeInChain([]),
    )
    const result = await getMyBookmarksDetail('eu-1')
    expect(result[0].title).toBeNull()
    expect(result[0].course_slug).toBeNull()
  })

  it('courses fetch DB エラーでも結果を返す（title=null）', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ;(listBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue([courseBookmark])
    mockClient(
      makeInChain([], { code: 'PGRST301', message: 'db error' }),
      makeInChain([]),
    )
    const result = await getMyBookmarksDetail('eu-1')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('course のみのブックマーク → createClient は呼ばれる・contents IN は呼ばれない', async () => {
    ;(listBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue([courseBookmark])
    const coursesStub = makeInChain([{ id: 'course-1', title: 'AI 入門', slug: 'intro-ai', thumbnail_url: null }])
    const contentsStub = makeInChain([])
    mockClient(coursesStub, contentsStub)
    const result = await getMyBookmarksDetail('eu-1')
    expect(result).toHaveLength(1)
    expect(contentsStub.select).not.toHaveBeenCalled()
  })
})
