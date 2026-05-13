import { describe, it, expect, vi, beforeEach } from 'vitest'

// createClient（server）をモック
vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// withdraw を責務分離でモック（内部動作は user-service.test.ts で網羅）
vi.mock('@/app/lib/services/user-service', () => ({
  withdraw: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { withdraw } from '@/app/lib/services/user-service'
import { POST } from '../route'

// supabase クライアントのスタブを組み立てるヘルパー
// route は auth.getUser のみ呼ぶ（e_learning_users SELECT は user-service 内部で完結）
function mockSupabaseClient({ user }: { user: object | null }) {
  const signOut = vi.fn().mockResolvedValue({})
  const getUser = vi.fn().mockResolvedValue({ data: { user } })

  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: { getUser, signOut },
  })

  return { signOut, getUser }
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('POST /api/me/withdraw', () => {
  it('未ログイン（getUser が null）→ 401 { error: { code: "UNAUTHORIZED" } }', async () => {
    mockSupabaseClient({ user: null })

    const res = await POST()
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: { code: 'UNAUTHORIZED' } })
  })

  it('e_learning_users 不存在（withdraw が user_not_found throw）→ 404 { error: { code: "NOT_FOUND" } }', async () => {
    mockSupabaseClient({ user: { id: 'auth-001' } })
    ;(withdraw as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('user_not_found'))

    const res = await POST()
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: { code: 'NOT_FOUND' } })
  })

  it('通常退会成功 → 200 { ok: true } + signOut 呼ばれる', async () => {
    const { signOut } = mockSupabaseClient({ user: { id: 'auth-001' } })
    ;(withdraw as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true })

    const res = await POST()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(withdraw).toHaveBeenCalledWith('auth-001')
    expect(signOut).toHaveBeenCalledOnce()
  })

  it('withdraw が throw（withdraw_failed）→ 500 { error: { code: "INTERNAL_ERROR" } } + signOut 呼ばれない', async () => {
    const { signOut } = mockSupabaseClient({ user: { id: 'auth-001' } })
    ;(withdraw as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('withdraw_failed'))

    const res = await POST()
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: { code: 'INTERNAL_ERROR' } })
    expect(signOut).not.toHaveBeenCalled()
  })
})
