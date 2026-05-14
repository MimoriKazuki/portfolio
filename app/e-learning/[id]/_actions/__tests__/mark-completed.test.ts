import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/app/lib/services/progress-service', () => ({
  markContentCompleted: vi.fn(),
  ProgressError: class ProgressError extends Error {
    constructor(public readonly code: string, message: string) {
      super(message)
      this.name = 'ProgressError'
    }
  },
}))

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { markContentCompleted, ProgressError } from '@/app/lib/services/progress-service'
import { markContentCompletedAction } from '../mark-completed'

// ----------------------------------------------------------------
// スタブ ビルダー
// ----------------------------------------------------------------

// supabase.auth.getUser() スタブ
function mockAuthGetUser(user: { id: string } | null) {
  return { data: { user }, error: null }
}

// e_learning_users .select().eq().maybeSingle() スタブ
function makeELearningUserChain(data: { id: string } | null, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error })
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  return { select }
}

function mockSupabaseClient(
  authUser: { id: string } | null,
  eLearningUser: { id: string } | null,
) {
  const from = vi.fn(() => makeELearningUserChain(eLearningUser))
  const auth = { getUser: vi.fn().mockResolvedValue(mockAuthGetUser(authUser)) }
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from, auth })
  return { from, auth }
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// markContentCompletedAction
// ----------------------------------------------------------------
describe('markContentCompletedAction', () => {
  it('未認証（user=null）→ { success: false, code: "UNAUTHENTICATED" }', async () => {
    mockSupabaseClient(null, null)
    const result = await markContentCompletedAction('content-1')
    expect(result).toEqual({ success: false, code: 'UNAUTHENTICATED' })
    expect(markContentCompleted).not.toHaveBeenCalled()
  })

  it('e_learning_users が見つからない → { success: false, code: "UNAUTHENTICATED" }', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, null)  // auth ユーザーはあるが e_learning_users は null
    const result = await markContentCompletedAction('content-1')
    expect(result).toEqual({ success: false, code: 'UNAUTHENTICATED' })
    expect(markContentCompleted).not.toHaveBeenCalled()
  })

  it('正常系 → { success: true, completed_at } + revalidatePath 呼び出し', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, { id: 'eu-1' })
    ;(markContentCompleted as ReturnType<typeof vi.fn>).mockResolvedValue({
      completed_at: '2026-05-14T10:00:00Z',
    })
    const result = await markContentCompletedAction('content-1')
    expect(result).toEqual({ success: true, completed_at: '2026-05-14T10:00:00Z' })
    expect(markContentCompleted).toHaveBeenCalledWith('eu-1', 'content-1')
    expect(revalidatePath).toHaveBeenCalledWith('/e-learning/content-1')
  })

  it('progress-service が FORBIDDEN_NO_ACCESS → { success: false, code: "FORBIDDEN_NO_ACCESS" }', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, { id: 'eu-1' })
    ;(markContentCompleted as ReturnType<typeof vi.fn>).mockRejectedValue(
      new ProgressError('FORBIDDEN_NO_ACCESS', '視聴権限がありません'),
    )
    const result = await markContentCompletedAction('content-1')
    expect(result).toEqual({ success: false, code: 'FORBIDDEN_NO_ACCESS' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('progress-service が NOT_FOUND → { success: false, code: "NOT_FOUND" }', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, { id: 'eu-1' })
    ;(markContentCompleted as ReturnType<typeof vi.fn>).mockRejectedValue(
      new ProgressError('NOT_FOUND', '対象が見つかりません'),
    )
    const result = await markContentCompletedAction('content-1')
    expect(result).toEqual({ success: false, code: 'NOT_FOUND' })
  })

  it('progress-service が DB_ERROR → { success: false, code: "DB_ERROR" }', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, { id: 'eu-1' })
    ;(markContentCompleted as ReturnType<typeof vi.fn>).mockRejectedValue(
      new ProgressError('DB_ERROR', 'DB エラー'),
    )
    const result = await markContentCompletedAction('content-1')
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
  })

  it('予期しない Error → { success: false, code: "DB_ERROR" }', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, { id: 'eu-1' })
    ;(markContentCompleted as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('unexpected'),
    )
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await markContentCompletedAction('content-1')
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
