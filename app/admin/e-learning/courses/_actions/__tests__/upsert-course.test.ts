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

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { requireAdmin } from '@/app/lib/auth/admin-guard'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createCourseAction,
  updateCourseAction,
  softDeleteCourseAction,
  type UpsertCourseInput,
} from '../upsert-course'

const validInput: UpsertCourseInput = {
  title: 'テストコース',
  slug: 'test-course',
  description: '説明',
  thumbnail_url: null,
  category_id: 'cat-001',
  is_free: false,
  price: 9800,
  stripe_price_id: 'price_001',
  is_published: false,
  is_featured: false,
}

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

function mockSupabaseInsert({
  data = null as object | null,
  error = null as object | null,
} = {}) {
  const single = vi.fn().mockResolvedValue({ data, error })
  const select = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select }))
  const from = vi.fn(() => ({ insert }))
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { insert, select, single }
}

function mockSupabaseUpdate({
  data = null as object | null,
  error = null as object | null,
} = {}) {
  const single = vi.fn().mockResolvedValue({ data, error })
  const select = vi.fn(() => ({ single }))
  const eq = vi.fn(() => ({ select }))
  const update = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ update }))
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { update, eq, select, single }
}

function mockSupabaseSoftDelete(error: object | null = null) {
  const updateEq = vi.fn().mockResolvedValue({ error })
  const update = vi.fn(() => ({ eq: updateEq }))
  const from = vi.fn(() => ({ update }))
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { update, updateEq }
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ================================================================
// createCourseAction（C006）
// ================================================================
describe('createCourseAction', () => {
  it('requireAdmin が 401 → UNAUTHORIZED', async () => {
    mockAdminUnauthorized()
    const result = await createCourseAction(validInput)
    expect(result).toEqual({ success: false, code: 'UNAUTHORIZED' })
  })

  it('requireAdmin が 403 → FORBIDDEN', async () => {
    mockAdminForbidden()
    const result = await createCourseAction(validInput)
    expect(result).toEqual({ success: false, code: 'FORBIDDEN' })
  })

  it('title が空 → VALIDATION_ERROR', async () => {
    mockAdminOk()
    const result = await createCourseAction({ ...validInput, title: '' })
    expect(result).toEqual({ success: false, code: 'VALIDATION_ERROR', message: expect.stringContaining('タイトル') })
  })

  it('slug が不正（大文字含む）→ VALIDATION_ERROR', async () => {
    mockAdminOk()
    const result = await createCourseAction({ ...validInput, slug: 'Invalid-SLUG' })
    expect(result).toEqual({ success: false, code: 'VALIDATION_ERROR', message: expect.stringContaining('スラッグ') })
  })

  it('slug が空 → VALIDATION_ERROR', async () => {
    mockAdminOk()
    const result = await createCourseAction({ ...validInput, slug: '' })
    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
  })

  it('category_id が空 → VALIDATION_ERROR', async () => {
    mockAdminOk()
    const result = await createCourseAction({ ...validInput, category_id: '' })
    expect(result).toEqual({ success: false, code: 'VALIDATION_ERROR', message: expect.stringContaining('カテゴリ') })
  })

  it('有料コースで price=null → VALIDATION_ERROR', async () => {
    mockAdminOk()
    const result = await createCourseAction({ ...validInput, is_free: false, price: null })
    expect(result).toEqual({ success: false, code: 'VALIDATION_ERROR', message: expect.stringContaining('価格') })
  })

  it('有料コースで price=0 → VALIDATION_ERROR', async () => {
    mockAdminOk()
    const result = await createCourseAction({ ...validInput, is_free: false, price: 0 })
    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
  })

  it('正常系：INSERT 成功 → { success: true, course_id, slug }', async () => {
    mockAdminOk()
    mockSupabaseInsert({ data: { id: 'c-001', slug: 'test-course' } })
    const result = await createCourseAction(validInput)
    expect(result).toEqual({ success: true, course_id: 'c-001', slug: 'test-course' })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/e-learning/courses')
  })

  it('23505 で slug を含むメッセージ → CONFLICT_SLUG', async () => {
    mockAdminOk()
    mockSupabaseInsert({ error: { code: '23505', message: 'duplicate key value for slug' } })
    const result = await createCourseAction(validInput)
    expect(result).toEqual({ success: false, code: 'CONFLICT_SLUG' })
  })

  it('23505 で stripe_price_id を含むメッセージ → CONFLICT_STRIPE_PRICE', async () => {
    mockAdminOk()
    mockSupabaseInsert({ error: { code: '23505', message: 'duplicate key value for stripe_price_id' } })
    const result = await createCourseAction(validInput)
    expect(result).toEqual({ success: false, code: 'CONFLICT_STRIPE_PRICE' })
  })

  it('その他 DB エラー → DB_ERROR', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockAdminOk()
    mockSupabaseInsert({ error: { code: 'PGRST301', message: 'db error' } })
    const result = await createCourseAction(validInput)
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
    consoleSpy.mockRestore()
  })

  it('無料コースのとき price / stripe_price_id は null に正規化される', async () => {
    mockAdminOk()
    let insertedRow: object | null = null
    const single = vi.fn().mockResolvedValue({ data: { id: 'c-free', slug: 'free-course' }, error: null })
    const select = vi.fn(() => ({ single }))
    const insert = vi.fn().mockImplementation((row: object) => {
      insertedRow = row
      return { select }
    })
    const from = vi.fn(() => ({ insert }))
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })

    await createCourseAction({ ...validInput, slug: 'free-course', is_free: true, price: 9800 })
    expect(insertedRow).toMatchObject({ is_free: true, price: null, stripe_price_id: null })
  })
})

// ================================================================
// updateCourseAction（C007）
// ================================================================
describe('updateCourseAction', () => {
  it('requireAdmin が 401 → UNAUTHORIZED', async () => {
    mockAdminUnauthorized()
    const result = await updateCourseAction('c-001', validInput)
    expect(result).toEqual({ success: false, code: 'UNAUTHORIZED' })
  })

  it('title が空 → VALIDATION_ERROR', async () => {
    mockAdminOk()
    const result = await updateCourseAction('c-001', { ...validInput, title: '' })
    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
  })

  it('正常系：UPDATE 成功 → { success: true, course_id, slug }', async () => {
    mockAdminOk()
    mockSupabaseUpdate({ data: { id: 'c-001', slug: 'test-course' } })
    const result = await updateCourseAction('c-001', validInput)
    expect(result).toEqual({ success: true, course_id: 'c-001', slug: 'test-course' })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/e-learning/courses')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/e-learning/courses/c-001/edit')
    expect(revalidatePath).toHaveBeenCalledWith('/e-learning/lp/courses/test-course')
  })

  it('23505 で slug を含むメッセージ → CONFLICT_SLUG', async () => {
    mockAdminOk()
    mockSupabaseUpdate({ error: { code: '23505', message: 'duplicate slug' } })
    const result = await updateCourseAction('c-001', validInput)
    expect(result).toEqual({ success: false, code: 'CONFLICT_SLUG' })
  })

  it('23505 で stripe_price_id を含むメッセージ → CONFLICT_STRIPE_PRICE', async () => {
    mockAdminOk()
    mockSupabaseUpdate({ error: { code: '23505', message: 'duplicate stripe_price_id' } })
    const result = await updateCourseAction('c-001', validInput)
    expect(result).toEqual({ success: false, code: 'CONFLICT_STRIPE_PRICE' })
  })

  it('その他 DB エラー → DB_ERROR', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabaseUpdate({ error: { code: 'PGRST999', message: 'unknown' } })
    mockAdminOk()
    const result = await updateCourseAction('c-001', validInput)
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
    consoleSpy.mockRestore()
  })
})

// ================================================================
// softDeleteCourseAction（C007）
// ================================================================
describe('softDeleteCourseAction', () => {
  it('requireAdmin が 401 → UNAUTHORIZED', async () => {
    mockAdminUnauthorized()
    const result = await softDeleteCourseAction('c-001')
    expect(result).toEqual({ success: false, code: 'UNAUTHORIZED' })
  })

  it('requireAdmin が 403 → FORBIDDEN', async () => {
    mockAdminForbidden()
    const result = await softDeleteCourseAction('c-001')
    expect(result).toEqual({ success: false, code: 'FORBIDDEN' })
  })

  it('DB エラー → { success: false, code: DB_ERROR }', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockAdminOk()
    mockSupabaseSoftDelete({ code: 'PGRST301', message: 'error' })
    const result = await softDeleteCourseAction('c-001')
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
    consoleSpy.mockRestore()
  })

  it('正常系：deleted_at と is_published=false をセットして UPDATE し redirect', async () => {
    mockAdminOk()
    const { update, updateEq } = mockSupabaseSoftDelete(null)
    ;(redirect as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    try {
      await softDeleteCourseAction('c-001')
    } catch (e) {
      if (!(e instanceof Error) || e.message !== 'NEXT_REDIRECT') throw e
    }

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ is_published: false }),
    )
    const updateArg = (update as ReturnType<typeof vi.fn>).mock.calls[0][0] as { deleted_at?: string; is_published?: boolean }
    expect(updateArg.deleted_at).toBeTruthy()
    expect(updateEq).toHaveBeenCalledWith('id', 'c-001')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/e-learning/courses')
    expect(redirect).toHaveBeenCalledWith('/admin/e-learning/courses')
  })
})
