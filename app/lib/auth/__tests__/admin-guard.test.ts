import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { isAdminEmail, requireAdmin, isAdminGuardErr } from '../admin-guard'

// ----------------------------------------------------------------
// isAdminEmail
// ----------------------------------------------------------------
describe('isAdminEmail', () => {
  afterEach(() => {
    delete process.env.ADMIN_EMAIL
  })

  it('email が null → false', () => {
    expect(isAdminEmail(null)).toBe(false)
  })

  it('email が undefined → false', () => {
    expect(isAdminEmail(undefined)).toBe(false)
  })

  it('email が空文字 → false', () => {
    expect(isAdminEmail('')).toBe(false)
  })

  it('ADMIN_EMAIL 未設定 → どんな email でも false', () => {
    delete process.env.ADMIN_EMAIL
    expect(isAdminEmail('admin@example.com')).toBe(false)
  })

  it('ADMIN_EMAIL=admin@example.com で一致する email → true', () => {
    process.env.ADMIN_EMAIL = 'admin@example.com'
    expect(isAdminEmail('admin@example.com')).toBe(true)
  })

  it('ADMIN_EMAIL=admin@example.com で別の email → false', () => {
    process.env.ADMIN_EMAIL = 'admin@example.com'
    expect(isAdminEmail('other@example.com')).toBe(false)
  })

  it('ADMIN_EMAIL=a@x.com,b@x.com で a@x.com → true', () => {
    process.env.ADMIN_EMAIL = 'a@x.com,b@x.com'
    expect(isAdminEmail('a@x.com')).toBe(true)
  })

  it('ADMIN_EMAIL=a@x.com,b@x.com で b@x.com → true', () => {
    process.env.ADMIN_EMAIL = 'a@x.com,b@x.com'
    expect(isAdminEmail('b@x.com')).toBe(true)
  })

  it('ADMIN_EMAIL=a@x.com,b@x.com で c@x.com → false', () => {
    process.env.ADMIN_EMAIL = 'a@x.com,b@x.com'
    expect(isAdminEmail('c@x.com')).toBe(false)
  })

  it('ADMIN_EMAIL にスペース混入でも trim して一致 → true', () => {
    process.env.ADMIN_EMAIL = ' a@x.com , b@x.com '
    expect(isAdminEmail('a@x.com')).toBe(true)
    expect(isAdminEmail('b@x.com')).toBe(true)
  })
})

// ----------------------------------------------------------------
// requireAdmin
// ----------------------------------------------------------------
function mockGetUser(user: object | null) {
  const getUser = vi.fn().mockResolvedValue({ data: { user } })
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: { getUser },
  })
}

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.ADMIN_EMAIL = 'admin@example.com'
  })

  afterEach(() => {
    delete process.env.ADMIN_EMAIL
  })

  it('未ログイン（user=null）→ { ok: false, status: 401, error: "unauthorized" }', async () => {
    mockGetUser(null)
    const result = await requireAdmin()
    expect(result).toEqual({ ok: false, status: 401, error: 'unauthorized' })
  })

  it('ログイン済かつ ADMIN_EMAIL 非該当 → { ok: false, status: 403, error: "forbidden" }', async () => {
    mockGetUser({ id: 'user-001', email: 'other@example.com' })
    const result = await requireAdmin()
    expect(result).toEqual({ ok: false, status: 403, error: 'forbidden' })
  })

  it('ログイン済かつ ADMIN_EMAIL 該当 → { ok: true, user: { id, email } }', async () => {
    mockGetUser({ id: 'admin-001', email: 'admin@example.com' })
    const result = await requireAdmin()
    expect(result).toEqual({ ok: true, user: { id: 'admin-001', email: 'admin@example.com' } })
  })
})

// ----------------------------------------------------------------
// isAdminGuardErr type predicate
// ----------------------------------------------------------------
describe('isAdminGuardErr', () => {
  it('ok=true 入力 → false', () => {
    const r = { ok: true as const, user: { id: 'x', email: 'a@b.com' } }
    expect(isAdminGuardErr(r)).toBe(false)
  })

  it('ok=false 入力（401）→ true', () => {
    const r = { ok: false as const, status: 401 as const, error: 'unauthorized' as const }
    expect(isAdminGuardErr(r)).toBe(true)
  })

  it('ok=false 入力（403）→ true', () => {
    const r = { ok: false as const, status: 403 as const, error: 'forbidden' as const }
    expect(isAdminGuardErr(r)).toBe(true)
  })
})
