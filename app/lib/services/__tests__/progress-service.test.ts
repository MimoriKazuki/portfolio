import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/app/lib/services/access-service', () => ({
  canViewCourseVideo: vi.fn(),
  canViewContent: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { canViewCourseVideo, canViewContent } from '@/app/lib/services/access-service'
import {
  markCourseVideoCompleted,
  markContentCompleted,
  getCourseProgress,
  isCourseCompleted,
  getCompletedCourseVideoIds,
  ProgressError,
} from '../progress-service'

// ----------------------------------------------------------------
// チェーンスタブ ビルダー
// ----------------------------------------------------------------

// .select().eq().maybeSingle() → { data, error }
function makeMaybySingleChain(data: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error })
  const eq = vi.fn(() => ({ maybeSingle, eq }))
  const select = vi.fn(() => ({ eq, maybeSingle }))
  return { select }
}

// .insert().select().single() → { data, error }
function makeInsertChain(data: unknown, error: unknown = null) {
  const single = vi.fn().mockResolvedValue({ data, error })
  const select = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select }))
  return { insert }
}

// e_learning_course_videos count 用：.select(_, {count, head}).eq() → { count, error }
// （chapter.course_id で 1 eq）
function makeVideosCountChain(count: number | null, error: unknown = null) {
  const eq1 = vi.fn().mockResolvedValue({ count, error })
  const select = vi.fn(() => ({ eq: eq1 }))
  return { select }
}

// e_learning_progress count 用：.select(_, {count, head}).eq(user_id).eq(course_id) → { count, error }
// （user_id と course_video.chapter.course_id で 2 eq）
function makeProgressCountChain(count: number | null, error: unknown = null) {
  const eq2 = vi.fn().mockResolvedValue({ count, error })
  const eq1 = vi.fn(() => ({ eq: eq2 }))
  const select = vi.fn(() => ({ eq: eq1 }))
  return { select }
}

// getCompletedCourseVideoIds 用：.select().eq().eq().not() → { data, error }
function makeProgressListChain(data: unknown[], error: unknown = null) {
  const result = Promise.resolve({ data, error })
  const not = vi.fn(() => result)
  const eq2 = vi.fn(() => ({ not, eq: vi.fn(() => ({ not })) }))
  const eq1 = vi.fn(() => ({ eq: eq2 }))
  const select = vi.fn(() => ({ eq: eq1 }))
  return { select }
}

type TableStub = { select?: ReturnType<typeof vi.fn>; insert?: ReturnType<typeof vi.fn> }

function mockClient(tables: Record<string, TableStub | TableStub[]>) {
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
  return { from }
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// markCourseVideoCompleted
// ----------------------------------------------------------------
describe('markCourseVideoCompleted', () => {
  const courseVideoData = {
    id: 'video-1',
    chapter: { course_id: 'course-1' },
  }

  it('権限なし（access.allowed=false）→ ProgressError FORBIDDEN_NO_ACCESS', async () => {
    ;(canViewCourseVideo as ReturnType<typeof vi.fn>).mockResolvedValue({ allowed: false, reason: 'not_purchased' })
    await expect(markCourseVideoCompleted('eu-1', 'video-1')).rejects.toSatisfy(
      (e: unknown) => e instanceof ProgressError && e.code === 'FORBIDDEN_NO_ACCESS',
    )
  })

  it('既存進捗あり → INSERT せず最初の completed_at を返す', async () => {
    ;(canViewCourseVideo as ReturnType<typeof vi.fn>).mockResolvedValue({ allowed: true, reason: 'full_access' })

    // 既存進捗 SELECT → 存在する
    // fetchCourseIdByCourseVideo → e_learning_course_videos
    // getCourseProgressCounts → e_learning_course_videos (count), e_learning_progress (count)
    mockClient({
      e_learning_progress: [
        makeMaybySingleChain({ id: 'prog-1', completed_at: '2026-01-01T10:00:00Z' }) as any,  // 既存進捗
        makeProgressCountChain(3) as any,   // 完了済件数
      ],
      e_learning_course_videos: [
        makeMaybySingleChain(courseVideoData) as any,  // fetchCourseIdByCourseVideo
        makeVideosCountChain(5) as any,   // 全動画件数
      ],
    })

    const result = await markCourseVideoCompleted('eu-1', 'video-1')
    expect(result.completed_at).toBe('2026-01-01T10:00:00Z')
  })

  it('既存なし → INSERT 実行 → course_completed=true を返す（全完了）', async () => {
    ;(canViewCourseVideo as ReturnType<typeof vi.fn>).mockResolvedValue({ allowed: true, reason: 'full_access' })

    mockClient({
      e_learning_progress: [
        makeMaybySingleChain(null) as any,                                              // 既存進捗なし
        makeInsertChain({ completed_at: '2026-01-02T10:00:00Z' }) as any,               // INSERT
        makeProgressCountChain(3) as any,   // 完了済件数（= total と一致）
      ],
      e_learning_course_videos: [
        makeMaybySingleChain(courseVideoData) as any,  // fetchCourseIdByCourseVideo
        makeVideosCountChain(3) as any,   // 全動画件数
      ],
    })

    const result = await markCourseVideoCompleted('eu-1', 'video-1')
    expect(result.completed_at).toBe('2026-01-02T10:00:00Z')
    expect(result.course_completed).toBe(true)
  })

  it('既存なし → INSERT 実行 → course_completed=false（未完了）', async () => {
    ;(canViewCourseVideo as ReturnType<typeof vi.fn>).mockResolvedValue({ allowed: true, reason: 'full_access' })

    mockClient({
      e_learning_progress: [
        makeMaybySingleChain(null) as any,
        makeInsertChain({ completed_at: '2026-01-02T10:00:00Z' }) as any,
        makeProgressCountChain(2) as any,   // 完了済 2件
      ],
      e_learning_course_videos: [
        makeMaybySingleChain(courseVideoData) as any,
        makeVideosCountChain(5) as any,   // 全動画 5件
      ],
    })

    const result = await markCourseVideoCompleted('eu-1', 'video-1')
    expect(result.course_completed).toBe(false)
  })

  it('コース動画件数 total=0 → course_completed=false（誤判定防止ガード）', async () => {
    ;(canViewCourseVideo as ReturnType<typeof vi.fn>).mockResolvedValue({ allowed: true, reason: 'full_access' })

    mockClient({
      e_learning_progress: [
        makeMaybySingleChain(null) as any,
        makeInsertChain({ completed_at: '2026-01-02T10:00:00Z' }) as any,
        makeProgressCountChain(0) as any,   // 完了済 0件
      ],
      e_learning_course_videos: [
        makeMaybySingleChain(courseVideoData) as any,
        makeVideosCountChain(0) as any,   // 全動画 0件（コースが空）
      ],
    })

    const result = await markCourseVideoCompleted('eu-1', 'video-1')
    expect(result.course_completed).toBe(false)
  })

  it('INSERT で UNIQUE 違反 23505 → 冪等再取得で completed_at 返却', async () => {
    ;(canViewCourseVideo as ReturnType<typeof vi.fn>).mockResolvedValue({ allowed: true, reason: 'full_access' })

    const uniqueError = { code: '23505', message: 'unique violation' }
    // 再取得用の maybySingle スタブ
    const retrySingle = vi.fn().mockResolvedValue({ data: { completed_at: '2026-01-03T00:00:00Z' }, error: null })
    const retryEq2 = vi.fn(() => ({ maybeSingle: retrySingle }))
    const retryEq1 = vi.fn(() => ({ eq: retryEq2 }))
    const retrySelect = vi.fn(() => ({ eq: retryEq1 }))
    const retryStub = { select: retrySelect }

    mockClient({
      e_learning_progress: [
        makeMaybySingleChain(null) as any,                    // 既存進捗なし
        makeInsertChain(null, uniqueError) as any,             // INSERT → UNIQUE 違反
        retryStub as any,                                      // 再取得
        makeProgressCountChain(3) as any,  // 完了済件数
      ],
      e_learning_course_videos: [
        makeMaybySingleChain(courseVideoData) as any,
        makeVideosCountChain(3) as any,
      ],
    })

    const result = await markCourseVideoCompleted('eu-1', 'video-1')
    expect(result.completed_at).toBe('2026-01-03T00:00:00Z')
  })
})

// ----------------------------------------------------------------
// markContentCompleted
// ----------------------------------------------------------------
describe('markContentCompleted', () => {
  it('権限なし（access.allowed=false）→ ProgressError FORBIDDEN_NO_ACCESS', async () => {
    ;(canViewContent as ReturnType<typeof vi.fn>).mockResolvedValue({ allowed: false, reason: 'not_purchased' })
    await expect(markContentCompleted('eu-1', 'content-1')).rejects.toSatisfy(
      (e: unknown) => e instanceof ProgressError && e.code === 'FORBIDDEN_NO_ACCESS',
    )
  })

  it('既存あり → 既存の completed_at を返す（INSERT しない）', async () => {
    ;(canViewContent as ReturnType<typeof vi.fn>).mockResolvedValue({ allowed: true, reason: 'full_access' })

    mockClient({
      e_learning_progress: makeMaybySingleChain({ id: 'prog-1', completed_at: '2026-01-01T10:00:00Z' }) as any,
    })

    const result = await markContentCompleted('eu-1', 'content-1')
    expect(result.completed_at).toBe('2026-01-01T10:00:00Z')
  })

  it('既存なし → INSERT 実行・completed_at を返す', async () => {
    ;(canViewContent as ReturnType<typeof vi.fn>).mockResolvedValue({ allowed: true, reason: 'full_access' })

    mockClient({
      e_learning_progress: [
        makeMaybySingleChain(null) as any,
        makeInsertChain({ completed_at: '2026-01-02T10:00:00Z' }) as any,
      ],
    })

    const result = await markContentCompleted('eu-1', 'content-1')
    expect(result.completed_at).toBe('2026-01-02T10:00:00Z')
  })

  it('INSERT で UNIQUE 違反 23505 → 冪等再取得で completed_at 返却', async () => {
    ;(canViewContent as ReturnType<typeof vi.fn>).mockResolvedValue({ allowed: true, reason: 'full_access' })

    const uniqueError = { code: '23505', message: 'unique violation' }
    const retrySingle = vi.fn().mockResolvedValue({ data: { completed_at: '2026-01-03T00:00:00Z' }, error: null })
    const retryEq2 = vi.fn(() => ({ maybeSingle: retrySingle }))
    const retryEq1 = vi.fn(() => ({ eq: retryEq2 }))
    const retrySelect = vi.fn(() => ({ eq: retryEq1 }))
    const retryStub = { select: retrySelect }

    mockClient({
      e_learning_progress: [
        makeMaybySingleChain(null) as any,
        makeInsertChain(null, uniqueError) as any,
        retryStub as any,
      ],
    })

    const result = await markContentCompleted('eu-1', 'content-1')
    expect(result.completed_at).toBe('2026-01-03T00:00:00Z')
  })
})

// ----------------------------------------------------------------
// getCourseProgress
// ----------------------------------------------------------------
describe('getCourseProgress', () => {
  it('total / completed を count で取得して返す', async () => {
    mockClient({
      e_learning_course_videos: makeVideosCountChain(5) as any,
      e_learning_progress: makeProgressCountChain(3) as any,
    })
    const result = await getCourseProgress('eu-1', 'course-1')
    expect(result).toEqual({ total: 5, completed: 3 })
  })

  it('total=0・completed=0 → 両方 0 で返す', async () => {
    mockClient({
      e_learning_course_videos: makeVideosCountChain(0) as any,
      e_learning_progress: makeProgressCountChain(0) as any,
    })
    const result = await getCourseProgress('eu-1', 'course-1')
    expect(result).toEqual({ total: 0, completed: 0 })
  })

  it('count が null（DB エラー等）→ 0 にフォールバック', async () => {
    mockClient({
      e_learning_course_videos: makeVideosCountChain(null) as any,
      e_learning_progress: makeProgressCountChain(null) as any,
    })
    const result = await getCourseProgress('eu-1', 'course-1')
    expect(result).toEqual({ total: 0, completed: 0 })
  })
})

// ----------------------------------------------------------------
// isCourseCompleted
// ----------------------------------------------------------------
describe('isCourseCompleted', () => {
  it('total>0 && completed>=total → true', async () => {
    mockClient({
      e_learning_course_videos: makeVideosCountChain(3) as any,
      e_learning_progress: makeProgressCountChain(3) as any,
    })
    expect(await isCourseCompleted('eu-1', 'course-1')).toBe(true)
  })

  it('total>0 && completed<total → false', async () => {
    mockClient({
      e_learning_course_videos: makeVideosCountChain(5) as any,
      e_learning_progress: makeProgressCountChain(3) as any,
    })
    expect(await isCourseCompleted('eu-1', 'course-1')).toBe(false)
  })

  it('total=0 → false（誤った完了判定を防ぐ）', async () => {
    mockClient({
      e_learning_course_videos: makeVideosCountChain(0) as any,
      e_learning_progress: makeProgressCountChain(0) as any,
    })
    expect(await isCourseCompleted('eu-1', 'course-1')).toBe(false)
  })
})

// ----------------------------------------------------------------
// getCompletedCourseVideoIds
// ----------------------------------------------------------------
describe('getCompletedCourseVideoIds', () => {
  it('完了済 course_video_id 配列を返す', async () => {
    const rows = [
      { course_video_id: 'video-1' },
      { course_video_id: 'video-2' },
    ]
    mockClient({
      e_learning_progress: makeProgressListChain(rows) as any,
    })
    const result = await getCompletedCourseVideoIds('eu-1', 'course-1')
    expect(result).toEqual(['video-1', 'video-2'])
  })

  it('null が混在した場合は除外する', async () => {
    const rows = [
      { course_video_id: 'video-1' },
      { course_video_id: null },
    ]
    mockClient({
      e_learning_progress: makeProgressListChain(rows) as any,
    })
    const result = await getCompletedCourseVideoIds('eu-1', 'course-1')
    expect(result).toEqual(['video-1'])
  })

  it('進捗がない場合は空配列を返す', async () => {
    mockClient({
      e_learning_progress: makeProgressListChain([]) as any,
    })
    const result = await getCompletedCourseVideoIds('eu-1', 'course-1')
    expect(result).toEqual([])
  })

  it('DB エラー → ProgressError DB_ERROR を throw', async () => {
    mockClient({
      e_learning_progress: makeProgressListChain([], { code: 'PGRST301', message: 'db error' }) as any,
    })
    await expect(getCompletedCourseVideoIds('eu-1', 'course-1')).rejects.toSatisfy(
      (e: unknown) => e instanceof ProgressError && e.code === 'DB_ERROR',
    )
  })
})
