import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/app/lib/services/progress-service', () => ({
  markCourseVideoCompleted: vi.fn(),
  ProgressError: class ProgressError extends Error {
    constructor(public readonly code: string, message: string) {
      super(message)
      this.name = 'ProgressError'
    }
  },
}))

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { markCourseVideoCompleted, ProgressError } from '@/app/lib/services/progress-service'
import { markCourseVideoCompletedAction } from '../mark-video-completed'

// ----------------------------------------------------------------
// スタブ ビルダー
// ----------------------------------------------------------------

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
  const auth = { getUser: vi.fn().mockResolvedValue({ data: { user: authUser }, error: null }) }
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from, auth })
  return { from, auth }
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// markCourseVideoCompletedAction
// ----------------------------------------------------------------
describe('markCourseVideoCompletedAction', () => {
  it('未認証（user=null）→ { success: false, code: "UNAUTHENTICATED" }', async () => {
    mockSupabaseClient(null, null)
    const result = await markCourseVideoCompletedAction('intro-ai', 'video-1')
    expect(result).toEqual({ success: false, code: 'UNAUTHENTICATED' })
    expect(markCourseVideoCompleted).not.toHaveBeenCalled()
  })

  it('e_learning_users が見つからない → { success: false, code: "UNAUTHENTICATED" }', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, null)
    const result = await markCourseVideoCompletedAction('intro-ai', 'video-1')
    expect(result).toEqual({ success: false, code: 'UNAUTHENTICATED' })
    expect(markCourseVideoCompleted).not.toHaveBeenCalled()
  })

  it('正常系 → success=true + completed_at + course_completed', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, { id: 'eu-1' })
    ;(markCourseVideoCompleted as ReturnType<typeof vi.fn>).mockResolvedValue({
      completed_at: '2026-05-14T10:00:00Z',
      course_completed: false,
    })
    const result = await markCourseVideoCompletedAction('intro-ai', 'video-1')
    expect(result).toEqual({
      success: true,
      completed_at: '2026-05-14T10:00:00Z',
      course_completed: false,
    })
    expect(markCourseVideoCompleted).toHaveBeenCalledWith('eu-1', 'video-1')
  })

  it('正常系：revalidatePath が動画ページとコース詳細の両方を呼ぶ', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, { id: 'eu-1' })
    ;(markCourseVideoCompleted as ReturnType<typeof vi.fn>).mockResolvedValue({
      completed_at: '2026-05-14T10:00:00Z',
      course_completed: true,
    })
    await markCourseVideoCompletedAction('intro-ai', 'video-1')
    expect(revalidatePath).toHaveBeenCalledWith('/e-learning/lp/courses/intro-ai/videos/video-1')
    expect(revalidatePath).toHaveBeenCalledWith('/e-learning/lp/courses/intro-ai')
    expect(revalidatePath).toHaveBeenCalledTimes(2)
  })

  it('FORBIDDEN_NO_ACCESS → { success: false, code: "FORBIDDEN_NO_ACCESS" }・revalidatePath 呼ばれない', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, { id: 'eu-1' })
    ;(markCourseVideoCompleted as ReturnType<typeof vi.fn>).mockRejectedValue(
      new ProgressError('FORBIDDEN_NO_ACCESS', '視聴権限がありません'),
    )
    const result = await markCourseVideoCompletedAction('intro-ai', 'video-1')
    expect(result).toEqual({ success: false, code: 'FORBIDDEN_NO_ACCESS' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('NOT_FOUND → { success: false, code: "NOT_FOUND" }', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, { id: 'eu-1' })
    ;(markCourseVideoCompleted as ReturnType<typeof vi.fn>).mockRejectedValue(
      new ProgressError('NOT_FOUND', '対象が見つかりません'),
    )
    const result = await markCourseVideoCompletedAction('intro-ai', 'video-1')
    expect(result).toEqual({ success: false, code: 'NOT_FOUND' })
  })

  it('DB_ERROR → { success: false, code: "DB_ERROR" }', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, { id: 'eu-1' })
    ;(markCourseVideoCompleted as ReturnType<typeof vi.fn>).mockRejectedValue(
      new ProgressError('DB_ERROR', 'DB エラー'),
    )
    const result = await markCourseVideoCompletedAction('intro-ai', 'video-1')
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
  })

  it('予期しない Error → { success: false, code: "DB_ERROR" } + console.error', async () => {
    mockSupabaseClient({ id: 'auth-uid-1' }, { id: 'eu-1' })
    ;(markCourseVideoCompleted as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('unexpected'),
    )
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await markCourseVideoCompletedAction('intro-ai', 'video-1')
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
