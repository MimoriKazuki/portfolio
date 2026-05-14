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
import { toggleCoursePublishedAction } from '../toggle-published'

function mockAdminOk() {
  ;(requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    user: { id: 'admin-001', email: 'admin@example.com' },
  })
}

function mockAdminUnauthorized() {
  ;(requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: false,
    status: 401,
    error: 'unauthorized',
  })
}

function mockAdminForbidden() {
  ;(requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: false,
    status: 403,
    error: 'forbidden',
  })
}

function mockSupabaseUpdate(error: object | null = null) {
  const updateEq = vi.fn().mockResolvedValue({ error })
  const update = vi.fn(() => ({ eq: updateEq }))
  const from = vi.fn(() => ({ update }))
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { update, updateEq }
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('toggleCoursePublishedAction', () => {
  it('requireAdmin が 401 → { success: false, code: UNAUTHORIZED }', async () => {
    mockAdminUnauthorized()
    const result = await toggleCoursePublishedAction('course-001', true)
    expect(result).toEqual({ success: false, code: 'UNAUTHORIZED' })
    expect(createClient).not.toHaveBeenCalled()
  })

  it('requireAdmin が 403 → { success: false, code: FORBIDDEN }', async () => {
    mockAdminForbidden()
    const result = await toggleCoursePublishedAction('course-001', true)
    expect(result).toEqual({ success: false, code: 'FORBIDDEN' })
  })

  it('正常系：is_published=true に切替 → { success: true, is_published: true }', async () => {
    mockAdminOk()
    mockSupabaseUpdate(null)
    const result = await toggleCoursePublishedAction('course-001', true)
    expect(result).toEqual({ success: true, is_published: true })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/e-learning/courses')
  })

  it('正常系：is_published=false に切替 → { success: true, is_published: false }', async () => {
    mockAdminOk()
    mockSupabaseUpdate(null)
    const result = await toggleCoursePublishedAction('course-001', false)
    expect(result).toEqual({ success: true, is_published: false })
  })

  it('DB エラー → { success: false, code: DB_ERROR } + revalidatePath 呼ばれない', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockAdminOk()
    mockSupabaseUpdate({ code: 'PGRST301', message: 'db error' })
    const result = await toggleCoursePublishedAction('course-001', true)
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
    expect(revalidatePath).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('UPDATE の引数が正しい（is_published と courseId）', async () => {
    mockAdminOk()
    const { update, updateEq } = mockSupabaseUpdate(null)
    await toggleCoursePublishedAction('course-abc', true)
    expect(update).toHaveBeenCalledWith({ is_published: true })
    expect(updateEq).toHaveBeenCalledWith('id', 'course-abc')
  })
})
