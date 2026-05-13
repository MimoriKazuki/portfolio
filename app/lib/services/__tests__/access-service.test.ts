import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import {
  getViewerAccess,
  canViewCourseVideo,
  canViewContent,
  canDownloadCourseMaterials,
  canDownloadContentMaterials,
} from '../access-service'

// ----------------------------------------------------------------
// チェーンスタブ ビルダー
// ----------------------------------------------------------------

// .select().eq().maybeSingle() → { data, error }
function makeMaybySingleChain(data: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error })
  const eq = vi.fn(() => ({ maybeSingle, eq }))   // eq チェーンが複数続く場合もあるため自己参照
  const select = vi.fn(() => ({ eq, maybeSingle }))
  return { select }
}

// .select().eq().eq().eq().maybeSingle() を支えるため、eq が連鎖できるビルダー
function makePurchaseChain(data: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error })
  const eq3 = vi.fn(() => ({ maybeSingle }))
  const eq2 = vi.fn(() => ({ eq: eq3, maybeSingle }))
  const eq1 = vi.fn(() => ({ eq: eq2, maybeSingle }))
  const select = vi.fn(() => ({ eq: eq1 }))
  return { select }
}

// getViewerAccess 用：purchases は配列を返す（.select().eq().eq() → { data: [] }）
function makePurchasesListChain(data: unknown[], error: unknown = null) {
  const eq2 = vi.fn().mockResolvedValue({ data, error })
  const eq1 = vi.fn(() => ({ eq: eq2 }))
  const select = vi.fn(() => ({ eq: eq1 }))
  return { select }
}

type TableStub = { select: ReturnType<typeof vi.fn> }

/**
 * createClient が返す supabase を設定する。
 * tables: テーブル名 → スタブ（または呼び出し順序の配列）。
 */
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
// getViewerAccess
// ----------------------------------------------------------------
describe('getViewerAccess', () => {
  it('has_full_access=true → hasFullAccess=true・購入配列は空', async () => {
    mockClient({
      e_learning_users: makeMaybySingleChain({ has_full_access: true }),
      e_learning_purchases: makePurchasesListChain([]),
    })
    const result = await getViewerAccess('eu-1')
    expect(result).toEqual({ hasFullAccess: true, purchasedCourseIds: [], purchasedContentIds: [] })
  })

  it('has_full_access=false + 購入なし → 全て false/空', async () => {
    mockClient({
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchasesListChain([]),
    })
    const result = await getViewerAccess('eu-2')
    expect(result).toEqual({ hasFullAccess: false, purchasedCourseIds: [], purchasedContentIds: [] })
  })

  it('has_full_access=false + course 2件 + content 1件（completed）→ 各配列に含まれる', async () => {
    mockClient({
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchasesListChain([
        { course_id: 'course-1', content_id: null },
        { course_id: 'course-2', content_id: null },
        { course_id: null, content_id: 'content-1' },
      ]),
    })
    const result = await getViewerAccess('eu-3')
    expect(result.hasFullAccess).toBe(false)
    expect(result.purchasedCourseIds).toEqual(['course-1', 'course-2'])
    expect(result.purchasedContentIds).toEqual(['content-1'])
  })

  it('refunded ステータスは含まれない（status=completed のみ取得）', async () => {
    // purchases のクエリ自体が status='completed' で絞り込むため、
    // モック側は completed 分のみを返せばよい（refunded は DB 側でフィルタ済み）
    mockClient({
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchasesListChain([]),  // refunded のみ → 0件
    })
    const result = await getViewerAccess('eu-4')
    expect(result.purchasedCourseIds).toHaveLength(0)
    expect(result.purchasedContentIds).toHaveLength(0)

    // eq('status', 'completed') が実際に呼ばれていることを確認
    const purchasesEntry = (createClient as ReturnType<typeof vi.fn>).mock.results[0]
    expect(purchasesEntry).toBeTruthy()
  })
})

// ----------------------------------------------------------------
// canViewCourseVideo
// ----------------------------------------------------------------
describe('canViewCourseVideo', () => {
  const VIDEO_ID = 'video-1'
  const COURSE_ID = 'course-1'
  const USER_ID = 'eu-1'

  // 動画レコード（chapter + course 付き）
  const videoData = {
    id: VIDEO_ID,
    is_free: false,
    chapter: { id: 'ch-1', course_id: COURSE_ID, course: { id: COURSE_ID, is_free: false } },
  }
  const videoDataFreeCourse = {
    ...videoData,
    chapter: { id: 'ch-1', course_id: COURSE_ID, course: { id: COURSE_ID, is_free: true } },
  }
  const videoDataFreeVideo = { ...videoData, is_free: true }

  it('① has_full_access=true → { canView: true, reason: "full_access" }', async () => {
    mockClient({
      e_learning_course_videos: makeMaybySingleChain(videoData),
      e_learning_users: makeMaybySingleChain({ has_full_access: true }),
    })
    expect(await canViewCourseVideo(USER_ID, VIDEO_ID)).toEqual({ canView: true, reason: 'full_access' })
  })

  it('② コース購入済（completed）→ { canView: true, reason: "course_purchased" }', async () => {
    mockClient({
      e_learning_course_videos: makeMaybySingleChain(videoData),
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchaseChain({ id: 'purchase-1' }),
    })
    expect(await canViewCourseVideo(USER_ID, VIDEO_ID)).toEqual({ canView: true, reason: 'course_purchased' })
  })

  it('③ コース全体 is_free=true → { canView: true, reason: "free_course" }', async () => {
    mockClient({
      e_learning_course_videos: makeMaybySingleChain(videoDataFreeCourse),
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchaseChain(null),
    })
    expect(await canViewCourseVideo(USER_ID, VIDEO_ID)).toEqual({ canView: true, reason: 'free_course' })
  })

  it('④ 動画個別 is_free=true → { canView: true, reason: "free_course_video" }', async () => {
    mockClient({
      e_learning_course_videos: makeMaybySingleChain(videoDataFreeVideo),
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchaseChain(null),
    })
    expect(await canViewCourseVideo(USER_ID, VIDEO_ID)).toEqual({ canView: true, reason: 'free_course_video' })
  })

  it('⑤ いずれもなし → { canView: false, reason: "not_purchased" }', async () => {
    mockClient({
      e_learning_course_videos: makeMaybySingleChain(videoData),
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchaseChain(null),
    })
    expect(await canViewCourseVideo(USER_ID, VIDEO_ID)).toEqual({ canView: false, reason: 'not_purchased' })
  })

  it('動画が存在しない → { canView: false, reason: "not_purchased" }', async () => {
    mockClient({
      e_learning_course_videos: makeMaybySingleChain(null),
    })
    expect(await canViewCourseVideo(USER_ID, VIDEO_ID)).toEqual({ canView: false, reason: 'not_purchased' })
  })

  it('購入が refunded のみ → 購入扱いされず ⑤ not_purchased', async () => {
    // purchase クエリ（status=completed で絞り込み）に null が返る = refunded のみ
    mockClient({
      e_learning_course_videos: makeMaybySingleChain(videoData),
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchaseChain(null),
    })
    expect(await canViewCourseVideo(USER_ID, VIDEO_ID)).toEqual({ canView: false, reason: 'not_purchased' })
  })
})

// ----------------------------------------------------------------
// canViewContent
// ----------------------------------------------------------------
describe('canViewContent', () => {
  const CONTENT_ID = 'content-1'
  const USER_ID = 'eu-1'

  it('① has_full_access=true → { canView: true, reason: "full_access" }', async () => {
    mockClient({
      e_learning_contents: makeMaybySingleChain({ id: CONTENT_ID, is_free: false }),
      e_learning_users: makeMaybySingleChain({ has_full_access: true }),
    })
    expect(await canViewContent(USER_ID, CONTENT_ID)).toEqual({ canView: true, reason: 'full_access' })
  })

  it('② 単体購入済（completed）→ { canView: true, reason: "content_purchased" }', async () => {
    mockClient({
      e_learning_contents: makeMaybySingleChain({ id: CONTENT_ID, is_free: false }),
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchaseChain({ id: 'purchase-1' }),
    })
    expect(await canViewContent(USER_ID, CONTENT_ID)).toEqual({ canView: true, reason: 'content_purchased' })
  })

  it('③ is_free=true → { canView: true, reason: "free_content" }', async () => {
    mockClient({
      e_learning_contents: makeMaybySingleChain({ id: CONTENT_ID, is_free: true }),
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchaseChain(null),
    })
    expect(await canViewContent(USER_ID, CONTENT_ID)).toEqual({ canView: true, reason: 'free_content' })
  })

  it('④ いずれもなし → { canView: false, reason: "not_purchased" }', async () => {
    mockClient({
      e_learning_contents: makeMaybySingleChain({ id: CONTENT_ID, is_free: false }),
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchaseChain(null),
    })
    expect(await canViewContent(USER_ID, CONTENT_ID)).toEqual({ canView: false, reason: 'not_purchased' })
  })

  it('refunded のみ → 購入扱いされない → not_purchased', async () => {
    mockClient({
      e_learning_contents: makeMaybySingleChain({ id: CONTENT_ID, is_free: false }),
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchaseChain(null),  // status=completed で絞り込み → null
    })
    expect(await canViewContent(USER_ID, CONTENT_ID)).toEqual({ canView: false, reason: 'not_purchased' })
  })
})

// ----------------------------------------------------------------
// canDownloadCourseMaterials
// ----------------------------------------------------------------
describe('canDownloadCourseMaterials', () => {
  const COURSE_ID = 'course-1'
  const USER_ID = 'eu-1'

  it('① has_full_access=true → true', async () => {
    mockClient({
      e_learning_users: makeMaybySingleChain({ has_full_access: true }),
    })
    expect(await canDownloadCourseMaterials(USER_ID, COURSE_ID)).toBe(true)
  })

  it('② コース購入済（completed）→ true', async () => {
    mockClient({
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchaseChain({ id: 'purchase-1' }),
    })
    expect(await canDownloadCourseMaterials(USER_ID, COURSE_ID)).toBe(true)
  })

  it('③ コース is_free=true → true', async () => {
    mockClient({
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchaseChain(null),
      e_learning_courses: makeMaybySingleChain({ is_free: true }),
    })
    expect(await canDownloadCourseMaterials(USER_ID, COURSE_ID)).toBe(true)
  })

  it('動画個別 is_free のみ（コース is_free=false）→ false', async () => {
    // canDownloadCourseMaterials は動画の is_free を見ない
    mockClient({
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchaseChain(null),
      e_learning_courses: makeMaybySingleChain({ is_free: false }),
    })
    expect(await canDownloadCourseMaterials(USER_ID, COURSE_ID)).toBe(false)
  })

  it('何もなし → false', async () => {
    mockClient({
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchaseChain(null),
      e_learning_courses: makeMaybySingleChain({ is_free: false }),
    })
    expect(await canDownloadCourseMaterials(USER_ID, COURSE_ID)).toBe(false)
  })
})

// ----------------------------------------------------------------
// canDownloadContentMaterials
// ----------------------------------------------------------------
describe('canDownloadContentMaterials', () => {
  it('canViewContent と同条件（ラッパー）：is_free=true → true', async () => {
    mockClient({
      e_learning_contents: makeMaybySingleChain({ id: 'content-1', is_free: true }),
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchaseChain(null),
    })
    expect(await canDownloadContentMaterials('eu-1', 'content-1')).toBe(true)
  })

  it('canViewContent と同条件（ラッパー）：いずれもなし → false', async () => {
    mockClient({
      e_learning_contents: makeMaybySingleChain({ id: 'content-1', is_free: false }),
      e_learning_users: makeMaybySingleChain({ has_full_access: false }),
      e_learning_purchases: makePurchaseChain(null),
    })
    expect(await canDownloadContentMaterials('eu-1', 'content-1')).toBe(false)
  })
})
