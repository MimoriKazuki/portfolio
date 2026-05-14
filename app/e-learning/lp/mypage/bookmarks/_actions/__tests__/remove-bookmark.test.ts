import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/app/lib/services/bookmark-service', () => ({
  remove: vi.fn(),
  BookmarkError: class BookmarkError extends Error {
    constructor(public readonly code: string, message: string) {
      super(message)
      this.name = 'BookmarkError'
    }
  },
}))

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { remove as removeBookmark, BookmarkError } from '@/app/lib/services/bookmark-service'
import { removeBookmarkAction } from '../remove-bookmark'

// ----------------------------------------------------------------
// スタブ ビルダー
// ----------------------------------------------------------------

function makeELearningUserChain(data: { id: string } | null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error: null })
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  return { select }
}

function mockSupabaseClient(
  authUser: { id: string } | null,
  eLearningUser: { id: string } | null,
) {
  const from = vi.fn(() => makeELearningUserChain(eLearningUser))
  const auth = { getUser: vi.fn().mockResolvedValue({ data: { user: authUser }, error: null }) }
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from, auth })
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// removeBookmarkAction
// ----------------------------------------------------------------
describe('removeBookmarkAction', () => {
  it('未認証（user=null）→ { success: false, code: "UNAUTHENTICATED" }', async () => {
    mockSupabaseClient(null, null)
    const result = await removeBookmarkAction('bm-1')
    expect(result).toEqual({ success: false, code: 'UNAUTHENTICATED' })
    expect(removeBookmark).not.toHaveBeenCalled()
  })

  it('e_learning_users 未解決 → { success: false, code: "UNAUTHENTICATED" }', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, null)
    const result = await removeBookmarkAction('bm-1')
    expect(result).toEqual({ success: false, code: 'UNAUTHENTICATED' })
    expect(removeBookmark).not.toHaveBeenCalled()
  })

  it('正常系 → { success: true } + revalidatePath 呼出', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, { id: 'eu-1' })
    ;(removeBookmark as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    const result = await removeBookmarkAction('bm-1')
    expect(result).toEqual({ success: true })
    expect(removeBookmark).toHaveBeenCalledWith('eu-1', 'bm-1')
    expect(revalidatePath).toHaveBeenCalledWith('/e-learning/lp/mypage/bookmarks')
  })

  it('BookmarkError(NOT_FOUND) → { success: false, code: "NOT_FOUND" }', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, { id: 'eu-1' })
    ;(removeBookmark as ReturnType<typeof vi.fn>).mockRejectedValue(
      new BookmarkError('NOT_FOUND', 'ブックマークが見つかりません'),
    )
    const result = await removeBookmarkAction('bm-1')
    expect(result).toEqual({ success: false, code: 'NOT_FOUND' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('BookmarkError(ALREADY_EXISTS など NOT_FOUND 以外) → { success: false, code: "DB_ERROR" }', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, { id: 'eu-1' })
    ;(removeBookmark as ReturnType<typeof vi.fn>).mockRejectedValue(
      new BookmarkError('DB_ERROR', 'DB エラー'),
    )
    const result = await removeBookmarkAction('bm-1')
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
  })

  it('予期しない Error → { success: false, code: "DB_ERROR" } + console.error', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, { id: 'eu-1' })
    ;(removeBookmark as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('unexpected'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await removeBookmarkAction('bm-1')
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
