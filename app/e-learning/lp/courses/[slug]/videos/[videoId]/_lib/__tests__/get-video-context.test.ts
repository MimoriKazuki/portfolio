import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { getCourseVideoContext } from '../get-video-context'

// ----------------------------------------------------------------
// チェーンスタブ ビルダー
// ----------------------------------------------------------------

// course_videos クエリ：.select().eq().maybeSingle() → { data, error }
function makeVideoChain(data: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error })
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  return { select }
}

// course_chapters クエリ：.select().eq().order() → { data, error }
function makeChaptersChain(data: unknown[], error: unknown = null) {
  const result = { data, error }
  const order = vi.fn().mockResolvedValue(result)
  const eq = vi.fn(() => ({ order }))
  const select = vi.fn(() => ({ eq }))
  return { select }
}

function mockClient(
  videoStub: ReturnType<typeof makeVideoChain>,
  chaptersStub: ReturnType<typeof makeChaptersChain>,
) {
  const from = vi.fn((name: string) => {
    if (name === 'e_learning_course_videos') return videoStub
    if (name === 'e_learning_course_chapters') return chaptersStub
    return {}
  })
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { from }
}

// ----------------------------------------------------------------
// テストデータ
// ----------------------------------------------------------------

function makeVideoData(overrides: Partial<{
  slug: string
  is_published: boolean
  deleted_at: string | null
}> = {}) {
  const {
    slug = 'intro-ai',
    is_published = true,
    deleted_at = null,
  } = overrides
  return {
    id: 'video-1', title: '動画1', description: 'desc', video_url: 'https://example.com/v.mp4',
    duration: '10分', is_free: false,
    chapter: {
      id: 'ch-1', title: '第1章', display_order: 1, course_id: 'course-1',
      course: { id: 'course-1', slug, title: 'AI 入門', is_free: false, is_published, deleted_at },
    },
  }
}

const rawChapters = [
  {
    id: 'ch-1', title: '第1章', display_order: 1,
    videos: [
      { id: 'video-1', title: '動画1', duration: '10分', is_free: false, display_order: 2 },
      { id: 'video-0', title: '動画0', duration: '5分', is_free: true, display_order: 1 },
    ],
  },
  { id: 'ch-2', title: '第2章', display_order: 2, videos: [] },
]

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// getCourseVideoContext
// ----------------------------------------------------------------
describe('getCourseVideoContext', () => {
  it('正常系：video + chapter + course + chapters を返す', async () => {
    const vStub = makeVideoChain(makeVideoData())
    const cStub = makeChaptersChain(rawChapters)
    mockClient(vStub, cStub)

    const result = await getCourseVideoContext('intro-ai', 'video-1')
    expect(result).not.toBeNull()
    expect(result!.course.slug).toBe('intro-ai')
    expect(result!.currentVideo.id).toBe('video-1')
    expect(result!.currentChapter.id).toBe('ch-1')
    expect(result!.chapters).toHaveLength(2)
  })

  it('chapters 内の動画が display_order 昇順でソートされる', async () => {
    const vStub = makeVideoChain(makeVideoData())
    const cStub = makeChaptersChain(rawChapters)
    mockClient(vStub, cStub)

    const result = await getCourseVideoContext('intro-ai', 'video-1')
    const ch1 = result!.chapters.find(c => c.id === 'ch-1')!
    expect(ch1.videos[0].id).toBe('video-0')   // display_order 1
    expect(ch1.videos[1].id).toBe('video-1')   // display_order 2
  })

  it('slug 不一致 → null', async () => {
    const vStub = makeVideoChain(makeVideoData({ slug: 'other-course' }))
    const cStub = makeChaptersChain([])
    mockClient(vStub, cStub)

    const result = await getCourseVideoContext('intro-ai', 'video-1')
    expect(result).toBeNull()
  })

  it('course.is_published=false → null', async () => {
    const vStub = makeVideoChain(makeVideoData({ is_published: false }))
    const cStub = makeChaptersChain([])
    mockClient(vStub, cStub)

    const result = await getCourseVideoContext('intro-ai', 'video-1')
    expect(result).toBeNull()
  })

  it('course.deleted_at != null → null', async () => {
    const vStub = makeVideoChain(makeVideoData({ deleted_at: '2026-01-01T00:00:00Z' }))
    const cStub = makeChaptersChain([])
    mockClient(vStub, cStub)

    const result = await getCourseVideoContext('intro-ai', 'video-1')
    expect(result).toBeNull()
  })

  it('video が null（存在しない videoId）→ null', async () => {
    const vStub = makeVideoChain(null)
    const cStub = makeChaptersChain([])
    mockClient(vStub, cStub)

    const result = await getCourseVideoContext('intro-ai', 'nonexistent')
    expect(result).toBeNull()
  })

  it('video DB エラー → console.error + null', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const vStub = makeVideoChain(null, { code: 'PGRST301', message: 'db error' })
    const cStub = makeChaptersChain([])
    mockClient(vStub, cStub)

    const result = await getCourseVideoContext('intro-ai', 'video-1')
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('chapter が配列形式で返っても正規化して処理する', async () => {
    const videoWithArrayChapter = {
      id: 'video-1', title: '動画1', description: null, video_url: 'https://example.com/v.mp4',
      duration: '10分', is_free: false,
      chapter: [{
        id: 'ch-1', title: '第1章', display_order: 1, course_id: 'course-1',
        course: { id: 'course-1', slug: 'intro-ai', title: 'AI 入門', is_free: false, is_published: true, deleted_at: null },
      }],
    }
    const vStub = makeVideoChain(videoWithArrayChapter)
    const cStub = makeChaptersChain(rawChapters)
    mockClient(vStub, cStub)

    const result = await getCourseVideoContext('intro-ai', 'video-1')
    expect(result).not.toBeNull()
    expect(result!.currentChapter.id).toBe('ch-1')
  })

  it('course が配列形式で返っても正規化して処理する', async () => {
    const videoWithArrayCourse = {
      id: 'video-1', title: '動画1', description: null, video_url: 'https://example.com/v.mp4',
      duration: '10分', is_free: false,
      chapter: {
        id: 'ch-1', title: '第1章', display_order: 1, course_id: 'course-1',
        course: [{ id: 'course-1', slug: 'intro-ai', title: 'AI 入門', is_free: false, is_published: true, deleted_at: null }],
      },
    }
    const vStub = makeVideoChain(videoWithArrayCourse)
    const cStub = makeChaptersChain(rawChapters)
    mockClient(vStub, cStub)

    const result = await getCourseVideoContext('intro-ai', 'video-1')
    expect(result).not.toBeNull()
    expect(result!.course.id).toBe('course-1')
  })
})
