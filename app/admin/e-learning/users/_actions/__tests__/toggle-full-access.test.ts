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
import { toggleFullAccessAction } from '../toggle-full-access'

function mockAdminOk(email = 'admin@example.com') {
  ;(requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    user: { id: 'admin-001', email },
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

type BeforeData = { email: string | null; has_full_access: boolean } | null

function mockSupabase({
  beforeData,
  updateError = null,
}: {
  beforeData: BeforeData
  updateError?: object | null
}) {
  const maybySingle = vi.fn().mockResolvedValue({ data: beforeData, error: null })
  const selectEq = vi.fn(() => ({ maybeSingle: maybySingle }))
  const select = vi.fn(() => ({ eq: selectEq }))

  const updateEq = vi.fn().mockResolvedValue({ error: updateError })
  const update = vi.fn(() => ({ eq: updateEq }))

  const from = vi.fn(() => ({ select, update }))
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { select, update, updateEq, maybySingle }
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('toggleFullAccessAction', () => {
  it('requireAdmin が 401 → UNAUTHORIZED', async () => {
    mockAdminUnauthorized()
    const result = await toggleFullAccessAction('eu-001', true)
    expect(result).toEqual({ success: false, code: 'UNAUTHORIZED' })
    expect(createClient).not.toHaveBeenCalled()
  })

  it('requireAdmin が 403 → FORBIDDEN', async () => {
    mockAdminForbidden()
    const result = await toggleFullAccessAction('eu-001', true)
    expect(result).toEqual({ success: false, code: 'FORBIDDEN' })
  })

  it('user 未存在（data=null）→ NOT_FOUND', async () => {
    mockAdminOk()
    mockSupabase({ beforeData: null })
    const result = await toggleFullAccessAction('eu-unknown', true)
    expect(result).toEqual({ success: false, code: 'NOT_FOUND' })
  })

  it('正常系：has_full_access=true に切替 → { success: true, has_full_access: true }', async () => {
    mockAdminOk()
    mockSupabase({ beforeData: { email: 'user@example.com', has_full_access: false } })
    const result = await toggleFullAccessAction('eu-001', true)
    expect(result).toEqual({ success: true, has_full_access: true })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/e-learning/users')
  })

  it('正常系：has_full_access=false に切替 → { success: true, has_full_access: false }', async () => {
    mockAdminOk()
    mockSupabase({ beforeData: { email: 'user@example.com', has_full_access: true } })
    const result = await toggleFullAccessAction('eu-001', false)
    expect(result).toEqual({ success: true, has_full_access: false })
  })

  it('DB UPDATE エラー → DB_ERROR + revalidatePath 呼ばれない', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockAdminOk()
    mockSupabase({
      beforeData: { email: 'user@example.com', has_full_access: false },
      updateError: { code: 'PGRST301', message: 'db error' },
    })
    const result = await toggleFullAccessAction('eu-001', true)
    expect(result).toEqual({ success: false, code: 'DB_ERROR' })
    expect(revalidatePath).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('UPDATE の引数が正しい（userId + nextValue）', async () => {
    mockAdminOk()
    const { update, updateEq } = mockSupabase({
      beforeData: { email: 'u@example.com', has_full_access: false },
    })
    await toggleFullAccessAction('eu-abc', true)
    expect(update).toHaveBeenCalledWith({ has_full_access: true })
    expect(updateEq).toHaveBeenCalledWith('id', 'eu-abc')
  })

  it('監査ログ（console.info）に admin_email / target_user_id / from / to が含まれる', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    mockAdminOk('ops@example.com')
    mockSupabase({ beforeData: { email: 'user@example.com', has_full_access: false } })
    await toggleFullAccessAction('eu-audit-001', true)
    const call = infoSpy.mock.calls.find(
      args => typeof args[0] === 'string' && args[0].includes('[c010]'),
    )
    expect(call).toBeDefined()
    expect(call![1]).toMatchObject({
      admin_email: 'ops@example.com',
      target_user_id: 'eu-audit-001',
      from: false,
      to: true,
    })
    infoSpy.mockRestore()
  })

  it('監査ログの target_user_email に before.email が渡される', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    mockAdminOk()
    mockSupabase({ beforeData: { email: 'target@example.com', has_full_access: true } })
    await toggleFullAccessAction('eu-email-001', false)
    const call = infoSpy.mock.calls.find(
      args => typeof args[0] === 'string' && args[0].includes('[c010]'),
    )
    expect(call![1]).toMatchObject({ target_user_email: 'target@example.com' })
    infoSpy.mockRestore()
  })
})
