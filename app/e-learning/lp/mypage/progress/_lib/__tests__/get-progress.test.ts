import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/app/lib/services/progress-service', () => ({
  getCourseProgress: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { getCourseProgress } from '@/app/lib/services/progress-service'
import { getMyProgress } from '../get-progress'

// ----------------------------------------------------------------
// チェーンスタブ ビルダー
// ----------------------------------------------------------------

// progress 一覧：.select().eq().order() → { data, error }
function makeProgressListChain(data: unknown[], error: unknown = null) {
  const result = { data, error }
  const order = vi.fn().mockResolvedValue(result)
  const eq = vi.fn(() => ({ order }))
  const select = vi.fn(() => ({ eq }))
  return { select }
}

// course_chapters：.select().eq().order() → { data, error }
function makeChaptersChain(data: unknown[], error: unknown = null) {
  const result = { data, error }
  const order = vi.fn().mockResolvedValue(result)
  const eq = vi.fn(() => ({ order }))
  const select = vi.fn(() => ({ eq }))
  return { select }
}

// 完了 video ID 一覧：.select().eq().not() → { data, error }
function makeCompletedVideosChain(data: unknown[], error: unknown = null) {
  const result = { data, error }
  const not = vi.fn().mockResolvedValue(result)
  const eq = vi.fn(() => ({ not }))
  const select = vi.fn(() => ({ eq }))
  return { select }
}

function mockClient(tables: Record<string, unknown | unknown[]>) {
  const callCounts: Record<string, number> = {}
  const from = vi.fn((name: string) => {
    const entry = tables[name]
    if (!entry) return {}
    if (Array.isArray(entry)) {
      const idx = callCounts[name] ?? 0
      callCounts[name] = idx + 1
      return entry[idx] ?? entry[entry.length - 1]
    }
    return entry
  })
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// テストデータ
// ----------------------------------------------------------------

const courseVideoRow = {
  id: 'prog-1',
  course_video_id: 'video-1',
  content_id: null,
  completed_at: '2026-05-01T10:00:00Z',
  course_video: {
    id: 'video-1',
    chapter: {
      course_id: 'course-1',
      course: { id: 'course-1', slug: 'intro-ai', title: 'AI 入門' },
    },
  },
  content: null,
}

const contentRow = {
  id: 'prog-2',
  course_video_id: null,
  content_id: 'content-1',
  completed_at: '2026-05-02T10:00:00Z',
  course_video: null,
  content: { id: 'content-1', title: 'ChatGPT 活用術' },
}

const chaptersData = [
  {
    id: 'ch-1',
    display_order: 1,
    videos: [
      { id: 'video-1', display_order: 1 },
      { id: 'video-2', display_order: 2 },
    ],
  },
]

// ----------------------------------------------------------------
// getMyProgress
// ----------------------------------------------------------------
describe('getMyProgress', () => {
  it('正常系：コース動画完了 → courses 配列に含まれる', async () => {
    ;(getCourseProgress as ReturnType<typeof vi.fn>).mockResolvedValue({ total: 2, completed: 1 })
    mockClient({
      e_learning_progress: [
        makeProgressListChain([courseVideoRow]),   // 1st: progress 一覧
        makeCompletedVideosChain([{ course_video_id: 'video-1' }]),  // 3rd: 完了 video IDs
      ],
      e_learning_course_chapters: makeChaptersChain(chaptersData),  // 2nd: chapters
    })
    const result = await getMyProgress('eu-1')
    expect(result.courses).toHaveLength(1)
    expect(result.courses[0].course_id).toBe('course-1')
    expect(result.courses[0].course_slug).toBe('intro-ai')
    expect(result.courses[0].completed).toBe(1)
    expect(result.courses[0].total).toBe(2)
  })

  it('正常系：単体動画完了 → contents 配列に含まれる', async () => {
    ;(getCourseProgress as ReturnType<typeof vi.fn>).mockResolvedValue({ total: 0, completed: 0 })
    mockClient({
      e_learning_progress: makeProgressListChain([contentRow]),
    })
    const result = await getMyProgress('eu-1')
    expect(result.contents).toHaveLength(1)
    expect(result.contents[0].content_id).toBe('content-1')
    expect(result.contents[0].content_title).toBe('ChatGPT 活用術')
  })

  it('次の未完了動画 ID を正しく解決する（video-2 が未完了）', async () => {
    ;(getCourseProgress as ReturnType<typeof vi.fn>).mockResolvedValue({ total: 2, completed: 1 })
    mockClient({
      e_learning_progress: [
        makeProgressListChain([courseVideoRow]),
        makeCompletedVideosChain([{ course_video_id: 'video-1' }]),  // video-1 のみ完了
      ],
      e_learning_course_chapters: makeChaptersChain(chaptersData),
    })
    const result = await getMyProgress('eu-1')
    expect(result.courses[0].next_video_id).toBe('video-2')
  })

  it('全動画完了（total=completed）→ next_video_id=null', async () => {
    ;(getCourseProgress as ReturnType<typeof vi.fn>).mockResolvedValue({ total: 1, completed: 1 })
    mockClient({
      e_learning_progress: makeProgressListChain([courseVideoRow]),
      e_learning_course_chapters: makeChaptersChain(chaptersData),
    })
    const result = await getMyProgress('eu-1')
    expect(result.courses[0].next_video_id).toBeNull()
  })

  it('total=0 → next_video_id=null（コースに動画なし）', async () => {
    ;(getCourseProgress as ReturnType<typeof vi.fn>).mockResolvedValue({ total: 0, completed: 0 })
    mockClient({
      e_learning_progress: makeProgressListChain([courseVideoRow]),
      e_learning_course_chapters: makeChaptersChain([]),
    })
    const result = await getMyProgress('eu-1')
    expect(result.courses[0].next_video_id).toBeNull()
  })

  it('progress fetch DB エラー → { courses: [], contents: [] }（throw しない）', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockClient({
      e_learning_progress: makeProgressListChain([], { code: 'PGRST301', message: 'db error' }),
    })
    const result = await getMyProgress('eu-1')
    expect(result.courses).toEqual([])
    expect(result.contents).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('空 progress → courses / contents 両方空', async () => {
    mockClient({
      e_learning_progress: makeProgressListChain([]),
    })
    const result = await getMyProgress('eu-1')
    expect(result.courses).toEqual([])
    expect(result.contents).toEqual([])
  })

  it('course JOIN が配列形式でも正規化して処理する', async () => {
    const rowWithArrayJoin = {
      ...courseVideoRow,
      course_video: {
        id: 'video-1',
        chapter: [{
          course_id: 'course-1',
          course: [{ id: 'course-1', slug: 'intro-ai', title: 'AI 入門' }],
        }],
      },
    }
    ;(getCourseProgress as ReturnType<typeof vi.fn>).mockResolvedValue({ total: 1, completed: 1 })
    mockClient({
      e_learning_progress: makeProgressListChain([rowWithArrayJoin]),
      e_learning_course_chapters: makeChaptersChain([]),
    })
    const result = await getMyProgress('eu-1')
    expect(result.courses[0].course_id).toBe('course-1')
  })

  it('getCourseProgress が throw → { total: 0, completed: 0 } にフォールバック', async () => {
    ;(getCourseProgress as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('service error'))
    mockClient({
      e_learning_progress: [
        makeProgressListChain([courseVideoRow]),
        makeCompletedVideosChain([]),
      ],
      e_learning_course_chapters: makeChaptersChain([]),
    })
    const result = await getMyProgress('eu-1')
    expect(result.courses[0].completed).toBe(0)
    expect(result.courses[0].total).toBe(0)
  })
})
