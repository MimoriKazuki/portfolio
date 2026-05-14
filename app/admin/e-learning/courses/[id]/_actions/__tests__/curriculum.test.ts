// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/app/lib/auth/admin-guard', () => ({
  requireAdmin: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { requireAdmin } from '@/app/lib/auth/admin-guard'
import { revalidatePath } from 'next/cache'
import {
  createChapterAction,
  updateChapterTitleAction,
  deleteChapterAction,
  reorderChaptersAction,
  createVideoAction,
  updateVideoAction,
  deleteVideoAction,
  reorderVideosAction,
  type VideoInput,
} from '../curriculum'

// ----------------------------------------------------------------
// Admin mock helpers
// ----------------------------------------------------------------
function mockAdminOk() {
  ;(requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true, user: { id: 'admin-001', email: 'admin@example.com' },
  })
}

function mockAdminUnauthorized() {
  ;(requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: false, status: 401, error: 'unauthorized',
  })
}

function mockAdminForbidden() {
  ;(requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: false, status: 403, error: 'forbidden',
  })
}

// ----------------------------------------------------------------
// Supabase mock helpers
// ----------------------------------------------------------------

// maybeSingle chain: .select().eq().order().limit().maybeSingle()
function makeMaybeChain(data: unknown) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error: null })
  const limit = vi.fn(() => ({ maybeSingle }))
  const order = vi.fn(() => ({ limit }))
  const eq = vi.fn(() => ({ order }))
  const select = vi.fn(() => ({ eq }))
  return { select, eq, order, limit, maybySingle: maybeSingle }
}

// simple maybeSingle for slug lookup: .select().eq().maybeSingle()
function makeSlugChain(slug: string | null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: slug ? { slug } : null, error: null })
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  return { select }
}

// insert chain: .insert().resolves({error})
function makeInsertChain(error: object | null = null) {
  const insert = vi.fn().mockResolvedValue({ error })
  return { insert }
}

// update chain: .update().eq().resolves({error})
function makeUpdateChain(error: object | null = null) {
  const updateEq = vi.fn().mockResolvedValue({ error })
  const update = vi.fn(() => ({ eq: updateEq }))
  return { update, updateEq }
}

// delete chain: .delete().eq().resolves({error})
function makeDeleteChain(error: object | null = null) {
  const deleteEq = vi.fn().mockResolvedValue({ error })
  const del = vi.fn(() => ({ eq: deleteEq }))
  return { delete: del, deleteEq }
}

// ----------------------------------------------------------------
// createChapterAction 用の full mock（max → insert → slug）
// ----------------------------------------------------------------
function mockClientForCreateChapter({
  maxDisplayOrder = 2,
  insertError = null,
  slug = 'test-course',
}: {
  maxDisplayOrder?: number
  insertError?: object | null
  slug?: string | null
} = {}) {
  let callCount = 0
  const from = vi.fn((table: string) => {
    callCount++
    if (table === 'e_learning_course_chapters' && callCount === 1) {
      // max SELECT
      const maybSingle = vi.fn().mockResolvedValue({ data: { display_order: maxDisplayOrder }, error: null })
      const limit = vi.fn(() => ({ maybeSingle: maybSingle }))
      const order = vi.fn(() => ({ limit }))
      const eq = vi.fn(() => ({ order }))
      const select = vi.fn(() => ({ eq }))
      return { select }
    }
    if (table === 'e_learning_course_chapters' && callCount === 2) {
      // INSERT
      return makeInsertChain(insertError)
    }
    // e_learning_courses slug lookup
    return makeSlugChain(slug)
  })
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { from }
}

// ----------------------------------------------------------------
// createVideoAction 用の full mock（max → insert → slug）
// ----------------------------------------------------------------
function mockClientForCreateVideo({
  maxDisplayOrder = 0,
  insertError = null,
  slug = 'test-course',
}: {
  maxDisplayOrder?: number
  insertError?: object | null
  slug?: string | null
} = {}) {
  let callCount = 0
  const from = vi.fn((table: string) => {
    callCount++
    if (table === 'e_learning_course_videos' && callCount === 1) {
      const maybSingle = vi.fn().mockResolvedValue({ data: { display_order: maxDisplayOrder }, error: null })
      const limit = vi.fn(() => ({ maybeSingle: maybSingle }))
      const order = vi.fn(() => ({ limit }))
      const eq = vi.fn(() => ({ order }))
      const select = vi.fn(() => ({ eq }))
      return { select }
    }
    if (table === 'e_learning_course_videos' && callCount === 2) {
      return makeInsertChain(insertError)
    }
    return makeSlugChain(slug)
  })
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
}

// ----------------------------------------------------------------
// update + slug mock（updateChapterTitle, updateVideo など）
// ----------------------------------------------------------------
function mockClientForUpdate({
  updateError = null,
  slug = 'test-course',
}: {
  updateError?: object | null
  slug?: string | null
} = {}) {
  let callCount = 0
  const from = vi.fn((table: string) => {
    callCount++
    if (callCount === 1) {
      return makeUpdateChain(updateError)
    }
    // slug lookup（e_learning_courses）
    return makeSlugChain(slug)
  })
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
}

// delete + slug mock
function mockClientForDelete({
  deleteError = null,
  slug = 'test-course',
}: {
  deleteError?: object | null
  slug?: string | null
} = {}) {
  let callCount = 0
  const from = vi.fn(() => {
    callCount++
    if (callCount === 1) {
      return makeDeleteChain(deleteError)
    }
    return makeSlugChain(slug)
  })
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
}

// reorder mock（stage1 update × N → stage2 update × N → slug lookup）
function mockClientForReorder({
  count,
  stage1Error = null,
  stage2Error = null,
  slug = 'test-course',
}: {
  count: number
  stage1Error?: object | null
  stage2Error?: object | null
  slug?: string | null
}) {
  let callCount = 0
  const updateCalls: Array<{ value: number }> = []

  const from = vi.fn(() => {
    callCount++
    // stage1: count 回
    if (callCount <= count) {
      const updateEq = vi.fn().mockResolvedValue({ error: stage1Error })
      const update = vi.fn((row: { display_order: number }) => {
        updateCalls.push({ value: row.display_order })
        return { eq: updateEq }
      })
      return { update }
    }
    // stage2: count 回
    if (callCount <= count * 2) {
      const updateEq = vi.fn().mockResolvedValue({ error: stage2Error })
      const update = vi.fn((row: { display_order: number }) => {
        updateCalls.push({ value: row.display_order })
        return { eq: updateEq }
      })
      return { update }
    }
    // slug lookup
    return makeSlugChain(slug)
  })
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { updateCalls }
}

beforeEach(() => {
  vi.resetAllMocks()
})

const validVideo: VideoInput = {
  title: 'テスト動画',
  video_url: 'https://example.com/video.mp4',
  description: null,
  duration: '10:00',
  is_free: false,
}

// ================================================================
// createChapterAction
// ================================================================
describe('createChapterAction', () => {
  it('requireAdmin が 401 → UNAUTHORIZED', async () => {
    mockAdminUnauthorized()
    const result = await createChapterAction('c-001', 'テスト章')
    expect(result).toEqual({ success: false, code: 'UNAUTHORIZED' })
  })

  it('requireAdmin が 403 → FORBIDDEN', async () => {
    mockAdminForbidden()
    const result = await createChapterAction('c-001', 'テスト章')
    expect(result).toEqual({ success: false, code: 'FORBIDDEN' })
  })

  it('title が空文字 → CONFLICT', async () => {
    mockAdminOk()
    const result = await createChapterAction('c-001', '')
    expect(result).toMatchObject({ success: false, code: 'CONFLICT', message: expect.stringContaining('章名') })
  })

  it('title が空白のみ → CONFLICT', async () => {
    mockAdminOk()
    const result = await createChapterAction('c-001', '   ')
    expect(result).toMatchObject({ success: false, code: 'CONFLICT' })
  })

  it('正常系：INSERT 成功 → { success: true }', async () => {
    mockAdminOk()
    mockClientForCreateChapter()
    const result = await createChapterAction('c-001', '第1章')
    expect(result).toEqual({ success: true })
  })

  it('display_order が maxRow.display_order + 1 で採番される', async () => {
    mockAdminOk()
    let insertedRow: object | null = null
    let callCount = 0
    const from = vi.fn((table: string) => {
      callCount++
      if (table === 'e_learning_course_chapters' && callCount === 1) {
        const maybSingle = vi.fn().mockResolvedValue({ data: { display_order: 3 }, error: null })
        const limit = vi.fn(() => ({ maybeSingle: maybSingle }))
        const order = vi.fn(() => ({ limit }))
        const eq = vi.fn(() => ({ order }))
        const select = vi.fn(() => ({ eq }))
        return { select }
      }
      if (table === 'e_learning_course_chapters' && callCount === 2) {
        const insert = vi.fn().mockImplementation((row: object) => {
          insertedRow = row
          return Promise.resolve({ error: null })
        })
        return { insert }
      }
      return makeSlugChain('test')
    })
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    await createChapterAction('c-001', '第4章')
    expect(insertedRow).toMatchObject({ display_order: 4 })
  })

  it('INSERT エラー → DB_ERROR', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockAdminOk()
    mockClientForCreateChapter({ insertError: { code: 'PGRST301', message: 'error' } })
    const result = await createChapterAction('c-001', '章')
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
    consoleSpy.mockRestore()
  })

  it('revalidatePath が編集・一覧・LP の 3 ルートで呼ばれる', async () => {
    mockAdminOk()
    mockClientForCreateChapter({ slug: 'my-course' })
    await createChapterAction('c-001', '章')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/e-learning/courses/c-001/edit')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/e-learning/courses')
    expect(revalidatePath).toHaveBeenCalledWith('/e-learning/lp/courses/my-course')
  })
})

// ================================================================
// updateChapterTitleAction
// ================================================================
describe('updateChapterTitleAction', () => {
  it('requireAdmin が 401 → UNAUTHORIZED', async () => {
    mockAdminUnauthorized()
    const result = await updateChapterTitleAction('ch-001', 'c-001', '章')
    expect(result).toEqual({ success: false, code: 'UNAUTHORIZED' })
  })

  it('title が空 → CONFLICT', async () => {
    mockAdminOk()
    const result = await updateChapterTitleAction('ch-001', 'c-001', '')
    expect(result).toMatchObject({ success: false, code: 'CONFLICT' })
  })

  it('正常系：UPDATE 成功 → { success: true }', async () => {
    mockAdminOk()
    mockClientForUpdate()
    const result = await updateChapterTitleAction('ch-001', 'c-001', '新章名')
    expect(result).toEqual({ success: true })
  })

  it('UPDATE エラー → DB_ERROR', async () => {
    mockAdminOk()
    mockClientForUpdate({ updateError: { code: 'PGRST301', message: 'error' } })
    const result = await updateChapterTitleAction('ch-001', 'c-001', '章')
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
  })

  it('revalidatePath が呼ばれる', async () => {
    mockAdminOk()
    mockClientForUpdate()
    await updateChapterTitleAction('ch-001', 'c-001', '章')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/e-learning/courses/c-001/edit')
  })
})

// ================================================================
// deleteChapterAction
// ================================================================
describe('deleteChapterAction', () => {
  it('requireAdmin が 401 → UNAUTHORIZED', async () => {
    mockAdminUnauthorized()
    const result = await deleteChapterAction('ch-001', 'c-001')
    expect(result).toEqual({ success: false, code: 'UNAUTHORIZED' })
  })

  it('正常系：DELETE 成功 → { success: true }', async () => {
    mockAdminOk()
    mockClientForDelete()
    const result = await deleteChapterAction('ch-001', 'c-001')
    expect(result).toEqual({ success: true })
  })

  it('DELETE エラー → DB_ERROR', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockAdminOk()
    mockClientForDelete({ deleteError: { code: 'PGRST301', message: 'error' } })
    const result = await deleteChapterAction('ch-001', 'c-001')
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
    consoleSpy.mockRestore()
  })

  it('revalidatePath が呼ばれる', async () => {
    mockAdminOk()
    mockClientForDelete()
    await deleteChapterAction('ch-001', 'c-001')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/e-learning/courses/c-001/edit')
  })
})

// ================================================================
// reorderChaptersAction
// ================================================================
describe('reorderChaptersAction', () => {
  it('requireAdmin が 401 → UNAUTHORIZED', async () => {
    mockAdminUnauthorized()
    const result = await reorderChaptersAction('c-001', ['ch-1', 'ch-2'])
    expect(result).toEqual({ success: false, code: 'UNAUTHORIZED' })
  })

  it('二段階更新：stage1 で 1000+i、stage2 で i+1 の値が UPDATE される', async () => {
    mockAdminOk()
    const { updateCalls } = mockClientForReorder({ count: 2 })

    await reorderChaptersAction('c-001', ['ch-a', 'ch-b'])

    // stage1: 1000, 1001
    expect(updateCalls[0].value).toBe(1000)
    expect(updateCalls[1].value).toBe(1001)
    // stage2: 1, 2
    expect(updateCalls[2].value).toBe(1)
    expect(updateCalls[3].value).toBe(2)
  })

  it('stage1 エラー → DB_ERROR を返す', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockAdminOk()
    mockClientForReorder({ count: 2, stage1Error: { code: 'PGRST301', message: 'error' } })
    const result = await reorderChaptersAction('c-001', ['ch-a', 'ch-b'])
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
    consoleSpy.mockRestore()
  })

  it('正常系：{ success: true } + revalidatePath', async () => {
    mockAdminOk()
    mockClientForReorder({ count: 2 })
    const result = await reorderChaptersAction('c-001', ['ch-a', 'ch-b'])
    expect(result).toEqual({ success: true })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/e-learning/courses/c-001/edit')
  })
})

// ================================================================
// createVideoAction
// ================================================================
describe('createVideoAction', () => {
  it('requireAdmin が 401 → UNAUTHORIZED', async () => {
    mockAdminUnauthorized()
    const result = await createVideoAction('ch-001', 'c-001', validVideo)
    expect(result).toEqual({ success: false, code: 'UNAUTHORIZED' })
  })

  it('title が空 → CONFLICT', async () => {
    mockAdminOk()
    const result = await createVideoAction('ch-001', 'c-001', { ...validVideo, title: '' })
    expect(result).toMatchObject({ success: false, code: 'CONFLICT', message: expect.stringContaining('タイトル') })
  })

  it('video_url が空 → CONFLICT', async () => {
    mockAdminOk()
    const result = await createVideoAction('ch-001', 'c-001', { ...validVideo, video_url: '' })
    expect(result).toMatchObject({ success: false, code: 'CONFLICT', message: expect.stringContaining('動画 URL') })
  })

  it('duration が 21 文字 → CONFLICT', async () => {
    mockAdminOk()
    const result = await createVideoAction('ch-001', 'c-001', { ...validVideo, duration: 'a'.repeat(21) })
    expect(result).toMatchObject({ success: false, code: 'CONFLICT', message: expect.stringContaining('20 文字') })
  })

  it('正常系：INSERT 成功 → { success: true }', async () => {
    mockAdminOk()
    mockClientForCreateVideo()
    const result = await createVideoAction('ch-001', 'c-001', validVideo)
    expect(result).toEqual({ success: true })
  })

  it('revalidatePath が呼ばれる（編集・一覧・LP）', async () => {
    mockAdminOk()
    mockClientForCreateVideo({ slug: 'my-course' })
    await createVideoAction('ch-001', 'c-001', validVideo)
    expect(revalidatePath).toHaveBeenCalledWith('/admin/e-learning/courses/c-001/edit')
    expect(revalidatePath).toHaveBeenCalledWith('/e-learning/lp/courses/my-course')
  })
})

// ================================================================
// updateVideoAction
// ================================================================
describe('updateVideoAction', () => {
  it('requireAdmin が 401 → UNAUTHORIZED', async () => {
    mockAdminUnauthorized()
    const result = await updateVideoAction('v-001', 'c-001', validVideo)
    expect(result).toEqual({ success: false, code: 'UNAUTHORIZED' })
  })

  it('title が空 → CONFLICT', async () => {
    mockAdminOk()
    const result = await updateVideoAction('v-001', 'c-001', { ...validVideo, title: '' })
    expect(result).toMatchObject({ success: false, code: 'CONFLICT' })
  })

  it('正常系：is_free 切替 → { success: true }', async () => {
    mockAdminOk()
    mockClientForUpdate()
    const result = await updateVideoAction('v-001', 'c-001', { ...validVideo, is_free: true })
    expect(result).toEqual({ success: true })
  })

  it('UPDATE エラー → DB_ERROR', async () => {
    mockAdminOk()
    mockClientForUpdate({ updateError: { code: 'PGRST301', message: 'error' } })
    const result = await updateVideoAction('v-001', 'c-001', validVideo)
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
  })

  it('revalidatePath が呼ばれる', async () => {
    mockAdminOk()
    mockClientForUpdate()
    await updateVideoAction('v-001', 'c-001', validVideo)
    expect(revalidatePath).toHaveBeenCalledWith('/admin/e-learning/courses/c-001/edit')
  })
})

// ================================================================
// deleteVideoAction
// ================================================================
describe('deleteVideoAction', () => {
  it('requireAdmin が 401 → UNAUTHORIZED', async () => {
    mockAdminUnauthorized()
    const result = await deleteVideoAction('v-001', 'c-001')
    expect(result).toEqual({ success: false, code: 'UNAUTHORIZED' })
  })

  it('正常系：DELETE 成功 → { success: true }', async () => {
    mockAdminOk()
    mockClientForDelete()
    const result = await deleteVideoAction('v-001', 'c-001')
    expect(result).toEqual({ success: true })
  })

  it('DELETE エラー → DB_ERROR', async () => {
    mockAdminOk()
    mockClientForDelete({ deleteError: { code: 'PGRST301', message: 'error' } })
    const result = await deleteVideoAction('v-001', 'c-001')
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
  })

  it('revalidatePath が呼ばれる', async () => {
    mockAdminOk()
    mockClientForDelete()
    await deleteVideoAction('v-001', 'c-001')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/e-learning/courses/c-001/edit')
  })
})

// ================================================================
// reorderVideosAction
// ================================================================
describe('reorderVideosAction', () => {
  it('requireAdmin が 401 → UNAUTHORIZED', async () => {
    mockAdminUnauthorized()
    const result = await reorderVideosAction('ch-001', 'c-001', ['v-1', 'v-2'])
    expect(result).toEqual({ success: false, code: 'UNAUTHORIZED' })
  })

  it('二段階更新：stage1 で 1000+i、stage2 で i+1 の値が UPDATE される', async () => {
    mockAdminOk()
    const { updateCalls } = mockClientForReorder({ count: 3 })

    await reorderVideosAction('ch-001', 'c-001', ['v-a', 'v-b', 'v-c'])

    expect(updateCalls[0].value).toBe(1000)
    expect(updateCalls[1].value).toBe(1001)
    expect(updateCalls[2].value).toBe(1002)
    expect(updateCalls[3].value).toBe(1)
    expect(updateCalls[4].value).toBe(2)
    expect(updateCalls[5].value).toBe(3)
  })

  it('stage1 エラー → DB_ERROR', async () => {
    mockAdminOk()
    mockClientForReorder({ count: 2, stage1Error: { code: 'PGRST301', message: 'error' } })
    const result = await reorderVideosAction('ch-001', 'c-001', ['v-a', 'v-b'])
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
  })

  it('正常系：{ success: true } + revalidatePath', async () => {
    mockAdminOk()
    mockClientForReorder({ count: 2 })
    const result = await reorderVideosAction('ch-001', 'c-001', ['v-a', 'v-b'])
    expect(result).toEqual({ success: true })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/e-learning/courses/c-001/edit')
  })
})
