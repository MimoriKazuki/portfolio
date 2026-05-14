import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { list, add, remove, BookmarkError } from '../bookmark-service'

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

// .delete().eq() → { error }
function makeDeleteChain(error: unknown = null) {
  const eq = vi.fn().mockResolvedValue({ error })
  const del = vi.fn(() => ({ eq }))
  return { delete: del }
}

// list 用：.select().eq().order() → { data, error }
// type='course'/'content' の場合は .not() も呼ばれる
function makeListChain(data: unknown[], error: unknown = null) {
  const result = Promise.resolve({ data, error })
  const not = vi.fn(() => result)
  const order = vi.fn(() => ({ ...result, not, then: result.then.bind(result) }))
  const eq = vi.fn(() => ({ order }))
  const select = vi.fn(() => ({ eq }))
  return { select, _order: order, _not: not }
}

type TableStub = { select?: ReturnType<typeof vi.fn>; insert?: ReturnType<typeof vi.fn>; delete?: ReturnType<typeof vi.fn> }

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
// list
// ----------------------------------------------------------------
describe('list', () => {
  it('type="all" → not() 呼ばれず全ブックマーク返却', async () => {
    const bookmarks = [
      { id: 'bm-1', user_id: 'eu-1', course_id: 'course-1', content_id: null, created_at: '2026-01-01T00:00:00Z' },
      { id: 'bm-2', user_id: 'eu-1', course_id: null, content_id: 'content-1', created_at: '2026-01-02T00:00:00Z' },
    ]
    const listStub = makeListChain(bookmarks)
    mockClient({ e_learning_bookmarks: listStub as any })
    const result = await list('eu-1', 'all')
    expect(result).toHaveLength(2)
    expect(listStub._not).not.toHaveBeenCalled()
  })

  it('type="course" → not("course_id", "is", null) が呼ばれる', async () => {
    const bookmarks = [
      { id: 'bm-1', user_id: 'eu-1', course_id: 'course-1', content_id: null, created_at: '2026-01-01T00:00:00Z' },
    ]
    const listStub = makeListChain(bookmarks)
    mockClient({ e_learning_bookmarks: listStub as any })
    const result = await list('eu-1', 'course')
    expect(listStub._not).toHaveBeenCalledWith('course_id', 'is', null)
    expect(result).toHaveLength(1)
  })

  it('type="content" → not("content_id", "is", null) が呼ばれる', async () => {
    const bookmarks = [
      { id: 'bm-2', user_id: 'eu-1', course_id: null, content_id: 'content-1', created_at: '2026-01-02T00:00:00Z' },
    ]
    const listStub = makeListChain(bookmarks)
    mockClient({ e_learning_bookmarks: listStub as any })
    const result = await list('eu-1', 'content')
    expect(listStub._not).toHaveBeenCalledWith('content_id', 'is', null)
    expect(result).toHaveLength(1)
  })

  it('DB エラー → BookmarkError DB_ERROR を throw', async () => {
    const listStub = makeListChain([], { code: 'PGRST301', message: 'db error' })
    mockClient({ e_learning_bookmarks: listStub as any })
    await expect(list('eu-1', 'all')).rejects.toSatisfy(
      (e: unknown) => e instanceof BookmarkError && e.code === 'DB_ERROR',
    )
  })
})

// ----------------------------------------------------------------
// add
// ----------------------------------------------------------------
describe('add', () => {
  const INSERTED: object = {
    id: 'bm-new',
    user_id: 'eu-1',
    course_id: 'course-1',
    content_id: null,
    created_at: '2026-01-01T00:00:00Z',
  }

  it('course 正常系：course_id にセット・content_id=null で INSERT', async () => {
    const published = { id: 'course-1', is_published: true, deleted_at: null }
    // assertTargetPublished → e_learning_courses.maybeSingle
    // 既存確認 → e_learning_bookmarks.maybeSingle（null=存在なし）
    // INSERT → e_learning_bookmarks.insert
    mockClient({
      e_learning_courses: makeMaybySingleChain(published),
      e_learning_bookmarks: [
        makeMaybySingleChain(null) as any,      // 既存確認
        makeInsertChain(INSERTED) as any,        // INSERT
      ],
    })
    const result = await add('eu-1', 'course', 'course-1')
    expect(result.course_id).toBe('course-1')
    expect(result.content_id).toBeNull()
  })

  it('content 正常系：content_id にセット・course_id=null で INSERT', async () => {
    const published = { id: 'content-1', is_published: true, deleted_at: null }
    const inserted = { id: 'bm-new2', user_id: 'eu-1', course_id: null, content_id: 'content-1', created_at: '2026-01-01T00:00:00Z' }
    mockClient({
      e_learning_contents: makeMaybySingleChain(published),
      e_learning_bookmarks: [
        makeMaybySingleChain(null) as any,
        makeInsertChain(inserted) as any,
      ],
    })
    const result = await add('eu-1', 'content', 'content-1')
    expect(result.content_id).toBe('content-1')
    expect(result.course_id).toBeNull()
  })

  it('is_published=false → BookmarkError NOT_FOUND', async () => {
    mockClient({
      e_learning_courses: makeMaybySingleChain({ id: 'course-1', is_published: false, deleted_at: null }),
    })
    await expect(add('eu-1', 'course', 'course-1')).rejects.toSatisfy(
      (e: unknown) => e instanceof BookmarkError && e.code === 'NOT_FOUND',
    )
  })

  it('deleted_at != null → BookmarkError NOT_FOUND', async () => {
    mockClient({
      e_learning_courses: makeMaybySingleChain({ id: 'course-1', is_published: true, deleted_at: '2026-01-01T00:00:00Z' }),
    })
    await expect(add('eu-1', 'course', 'course-1')).rejects.toSatisfy(
      (e: unknown) => e instanceof BookmarkError && e.code === 'NOT_FOUND',
    )
  })

  it('対象が存在しない（null）→ BookmarkError NOT_FOUND', async () => {
    mockClient({
      e_learning_courses: makeMaybySingleChain(null),
    })
    await expect(add('eu-1', 'course', 'course-1')).rejects.toSatisfy(
      (e: unknown) => e instanceof BookmarkError && e.code === 'NOT_FOUND',
    )
  })

  it('targetType が course_video → BookmarkError BAD_REQUEST（M4 コース内動画拒否）', async () => {
    // targetType のバリデーションは createClient より前に発生するためモック不要
    await expect(add('eu-1', 'course_video' as any, 'video-1')).rejects.toSatisfy(
      (e: unknown) => e instanceof BookmarkError && e.code === 'BAD_REQUEST',
    )
  })

  it('既存重複 → BookmarkError ALREADY_EXISTS（事前 SELECT 経路）', async () => {
    const published = { id: 'course-1', is_published: true, deleted_at: null }
    mockClient({
      e_learning_courses: makeMaybySingleChain(published),
      e_learning_bookmarks: makeMaybySingleChain({ id: 'bm-existing' }) as any,
    })
    await expect(add('eu-1', 'course', 'course-1')).rejects.toSatisfy(
      (e: unknown) => e instanceof BookmarkError && e.code === 'ALREADY_EXISTS',
    )
  })

  it('並行 INSERT で UNIQUE 違反 code=23505 → ALREADY_EXISTS にマップ', async () => {
    const published = { id: 'course-1', is_published: true, deleted_at: null }
    const uniqueError = { code: '23505', message: 'unique violation' }
    mockClient({
      e_learning_courses: makeMaybySingleChain(published),
      e_learning_bookmarks: [
        makeMaybySingleChain(null) as any,          // 既存確認 → なし
        makeInsertChain(null, uniqueError) as any,   // INSERT → UNIQUE 違反
      ],
    })
    await expect(add('eu-1', 'course', 'course-1')).rejects.toSatisfy(
      (e: unknown) => e instanceof BookmarkError && e.code === 'ALREADY_EXISTS',
    )
  })
})

// ----------------------------------------------------------------
// remove
// ----------------------------------------------------------------
describe('remove', () => {
  it('自分の bookmark → DELETE 実行・正常終了', async () => {
    const bookmark = { id: 'bm-1', user_id: 'eu-1' }
    const delStub = makeDeleteChain(null)
    mockClient({
      e_learning_bookmarks: [
        makeMaybySingleChain(bookmark) as any,   // SELECT
        delStub as any,                           // DELETE
      ],
    })
    await expect(remove('eu-1', 'bm-1')).resolves.toBeUndefined()
    expect(delStub.delete).toHaveBeenCalled()
  })

  it('他人の bookmark → BookmarkError NOT_FOUND（DELETE 呼ばれない）', async () => {
    const bookmark = { id: 'bm-1', user_id: 'eu-other' }
    const delStub = makeDeleteChain(null)
    mockClient({
      e_learning_bookmarks: [
        makeMaybySingleChain(bookmark) as any,
        delStub as any,
      ],
    })
    await expect(remove('eu-1', 'bm-1')).rejects.toSatisfy(
      (e: unknown) => e instanceof BookmarkError && e.code === 'NOT_FOUND',
    )
    expect(delStub.delete).not.toHaveBeenCalled()
  })

  it('存在しない bookmark → BookmarkError NOT_FOUND（漏洩防止で同じエラー）', async () => {
    mockClient({
      e_learning_bookmarks: makeMaybySingleChain(null) as any,
    })
    await expect(remove('eu-1', 'nonexistent')).rejects.toSatisfy(
      (e: unknown) => e instanceof BookmarkError && e.code === 'NOT_FOUND',
    )
  })

  it('DELETE で DB エラー → BookmarkError DB_ERROR', async () => {
    const bookmark = { id: 'bm-1', user_id: 'eu-1' }
    const delStub = makeDeleteChain({ code: 'PGRST301', message: 'db error' })
    mockClient({
      e_learning_bookmarks: [
        makeMaybySingleChain(bookmark) as any,
        delStub as any,
      ],
    })
    await expect(remove('eu-1', 'bm-1')).rejects.toSatisfy(
      (e: unknown) => e instanceof BookmarkError && e.code === 'DB_ERROR',
    )
  })
})
