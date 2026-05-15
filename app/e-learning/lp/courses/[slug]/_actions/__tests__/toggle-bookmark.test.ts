import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/app/lib/services/bookmark-service', () => ({
  add: vi.fn(),
  remove: vi.fn(),
  BookmarkError: class BookmarkError extends Error {
    code: string
    constructor(code: string, message: string) {
      super(message)
      this.code = code
      this.name = 'BookmarkError'
    }
  },
}))

import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'
import {
  add as addBookmark,
  remove as removeBookmark,
  BookmarkError,
} from '@/app/lib/services/bookmark-service'
import { toggleBookmarkAction } from '../toggle-bookmark'

// ----------------------------------------------------------------
// Supabase クライアント スタブ
// ----------------------------------------------------------------

function mockAuthUser(userId: string | null) {
  const getUser = vi.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null } })
  return { auth: { getUser } }
}

function makeELearningUserChain(data: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error })
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  return { from: vi.fn(() => ({ select })) }
}

function mockClientWithUser(userId: string | null, eLearningUser: unknown) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: eLearningUser, error: null })
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select }))
  const auth = { getUser: vi.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null } }) }
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ auth, from })
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// 認証・ユーザー解決
// ----------------------------------------------------------------

describe('toggleBookmarkAction — 認証・ユーザー解決', () => {
  it('未ログイン（auth.getUser が null）→ UNAUTHORIZED', async () => {
    const auth = { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) }
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ auth, from: vi.fn() })

    const result = await toggleBookmarkAction({
      courseId: 'course-1',
      courseSlug: 'intro-ai',
      currentlyBookmarked: false,
    })

    expect(result).toEqual({ ok: false, error: 'UNAUTHORIZED' })
  })

  it('e_learning_users が見つからない → UNAUTHORIZED', async () => {
    mockClientWithUser('auth-1', null)

    const result = await toggleBookmarkAction({
      courseId: 'course-1',
      courseSlug: 'intro-ai',
      currentlyBookmarked: false,
    })

    expect(result).toEqual({ ok: false, error: 'UNAUTHORIZED' })
  })
})

// ----------------------------------------------------------------
// ブックマーク追加（currentlyBookmarked=false）
// ----------------------------------------------------------------

describe('toggleBookmarkAction — 追加（currentlyBookmarked=false）', () => {
  it('add 成功 → { ok: true, isBookmarked: true, bookmarkId }', async () => {
    mockClientWithUser('auth-1', { id: 'eu-1' })
    ;(addBookmark as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'bm-new' })

    const result = await toggleBookmarkAction({
      courseId: 'course-1',
      courseSlug: 'intro-ai',
      currentlyBookmarked: false,
    })

    expect(result).toEqual({ ok: true, isBookmarked: true, bookmarkId: 'bm-new' })
  })

  it('add 成功時に revalidatePath が course slug で呼ばれる', async () => {
    mockClientWithUser('auth-1', { id: 'eu-1' })
    ;(addBookmark as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'bm-new' })

    await toggleBookmarkAction({
      courseId: 'course-1',
      courseSlug: 'intro-ai',
      currentlyBookmarked: false,
    })

    expect(revalidatePath).toHaveBeenCalledWith('/e-learning/lp/courses/intro-ai')
  })

  it('add が BookmarkError(ALREADY_EXISTS) → { ok: false, error: ALREADY_EXISTS }', async () => {
    mockClientWithUser('auth-1', { id: 'eu-1' })
    ;(addBookmark as ReturnType<typeof vi.fn>).mockRejectedValue(
      new BookmarkError('ALREADY_EXISTS', '既にブックマーク済み'),
    )

    const result = await toggleBookmarkAction({
      courseId: 'course-1',
      courseSlug: 'intro-ai',
      currentlyBookmarked: false,
    })

    expect(result).toEqual({ ok: false, error: 'ALREADY_EXISTS' })
  })

  it('add が BookmarkError(NOT_FOUND) → { ok: false, error: NOT_FOUND }', async () => {
    mockClientWithUser('auth-1', { id: 'eu-1' })
    ;(addBookmark as ReturnType<typeof vi.fn>).mockRejectedValue(
      new BookmarkError('NOT_FOUND', '対象が見つかりません'),
    )

    const result = await toggleBookmarkAction({
      courseId: 'course-1',
      courseSlug: 'intro-ai',
      currentlyBookmarked: false,
    })

    expect(result).toEqual({ ok: false, error: 'NOT_FOUND' })
  })

  it('add が BookmarkError(DB_ERROR) → { ok: false, error: DB_ERROR }', async () => {
    mockClientWithUser('auth-1', { id: 'eu-1' })
    ;(addBookmark as ReturnType<typeof vi.fn>).mockRejectedValue(
      new BookmarkError('DB_ERROR', 'DB エラー'),
    )

    const result = await toggleBookmarkAction({
      courseId: 'course-1',
      courseSlug: 'intro-ai',
      currentlyBookmarked: false,
    })

    expect(result).toEqual({ ok: false, error: 'DB_ERROR' })
  })

  it('add が 想定外 Error → { ok: false, error: DB_ERROR }', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockClientWithUser('auth-1', { id: 'eu-1' })
    ;(addBookmark as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('unexpected'))

    const result = await toggleBookmarkAction({
      courseId: 'course-1',
      courseSlug: 'intro-ai',
      currentlyBookmarked: false,
    })

    expect(result).toEqual({ ok: false, error: 'DB_ERROR' })
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

// ----------------------------------------------------------------
// ブックマーク削除（currentlyBookmarked=true）
// ----------------------------------------------------------------

describe('toggleBookmarkAction — 削除（currentlyBookmarked=true）', () => {
  it('bookmarkId=undefined → { ok: false, error: BAD_REQUEST }', async () => {
    mockClientWithUser('auth-1', { id: 'eu-1' })

    const result = await toggleBookmarkAction({
      courseId: 'course-1',
      courseSlug: 'intro-ai',
      currentlyBookmarked: true,
      bookmarkId: undefined,
    })

    expect(result).toEqual({ ok: false, error: 'BAD_REQUEST' })
  })

  it('bookmarkId=null → { ok: false, error: BAD_REQUEST }', async () => {
    mockClientWithUser('auth-1', { id: 'eu-1' })

    const result = await toggleBookmarkAction({
      courseId: 'course-1',
      courseSlug: 'intro-ai',
      currentlyBookmarked: true,
      bookmarkId: null,
    })

    expect(result).toEqual({ ok: false, error: 'BAD_REQUEST' })
  })

  it('remove 成功 → { ok: true, isBookmarked: false, bookmarkId: null }', async () => {
    mockClientWithUser('auth-1', { id: 'eu-1' })
    ;(removeBookmark as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

    const result = await toggleBookmarkAction({
      courseId: 'course-1',
      courseSlug: 'intro-ai',
      currentlyBookmarked: true,
      bookmarkId: 'bm-1',
    })

    expect(result).toEqual({ ok: true, isBookmarked: false, bookmarkId: null })
  })

  it('remove 成功時に revalidatePath が course slug で呼ばれる', async () => {
    mockClientWithUser('auth-1', { id: 'eu-1' })
    ;(removeBookmark as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

    await toggleBookmarkAction({
      courseId: 'course-1',
      courseSlug: 'intro-ai',
      currentlyBookmarked: true,
      bookmarkId: 'bm-1',
    })

    expect(revalidatePath).toHaveBeenCalledWith('/e-learning/lp/courses/intro-ai')
  })

  it('remove が BookmarkError(NOT_FOUND) → { ok: false, error: NOT_FOUND }', async () => {
    mockClientWithUser('auth-1', { id: 'eu-1' })
    ;(removeBookmark as ReturnType<typeof vi.fn>).mockRejectedValue(
      new BookmarkError('NOT_FOUND', 'ブックマークが見つかりません'),
    )

    const result = await toggleBookmarkAction({
      courseId: 'course-1',
      courseSlug: 'intro-ai',
      currentlyBookmarked: true,
      bookmarkId: 'bm-1',
    })

    expect(result).toEqual({ ok: false, error: 'NOT_FOUND' })
  })
})
