import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { getAdminUsers } from '../get-admin-users'

// getAdminUsers は .is(deleted_at,null) → .order() の後に条件を付与する thenable chain
function makeChain(data: unknown, error: unknown = null) {
  const chain: Record<string, unknown> = {}
  const resolveValue = { data, error }
  chain.then = (onFulfilled: (v: unknown) => unknown) => Promise.resolve(resolveValue).then(onFulfilled)
  chain.catch = (onRejected: (e: unknown) => unknown) => Promise.resolve(resolveValue).catch(onRejected)
  const methods = ['is', 'order', 'eq', 'or', 'select']
  for (const m of methods) {
    chain[m] = vi.fn(() => chain)
  }
  return chain
}

const userRow = {
  id: 'eu-001',
  email: 'user@example.com',
  display_name: 'テストユーザー',
  avatar_url: null,
  has_full_access: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
}

function mockClient(chain: ReturnType<typeof makeChain>) {
  const from = vi.fn(() => chain)
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
  return { from }
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('getAdminUsers', () => {
  it('正常系：active ユーザー一覧を返す・has_full_access を boolean に正規化', async () => {
    const chain = makeChain([{ ...userRow, has_full_access: 1 }])
    mockClient(chain)
    const result = await getAdminUsers()
    expect(result).toHaveLength(1)
    expect(result[0].has_full_access).toBe(true)
    // deleted_at IS NULL フィルタが適用される
    expect(chain.is).toHaveBeenCalledWith('deleted_at', null)
  })

  it('hasFullAccess=true → eq(has_full_access, true) が呼ばれる', async () => {
    const chain = makeChain([userRow])
    mockClient(chain)
    await getAdminUsers({ hasFullAccess: 'true' })
    expect(chain.eq).toHaveBeenCalledWith('has_full_access', true)
  })

  it('hasFullAccess=false → eq(has_full_access, false) が呼ばれる', async () => {
    const chain = makeChain([])
    mockClient(chain)
    await getAdminUsers({ hasFullAccess: 'false' })
    expect(chain.eq).toHaveBeenCalledWith('has_full_access', false)
  })

  it('hasFullAccess=all → eq は呼ばれない', async () => {
    const chain = makeChain([userRow])
    mockClient(chain)
    await getAdminUsers({ hasFullAccess: 'all' })
    expect(chain.eq).not.toHaveBeenCalled()
  })

  it('keyword フィルタ → or(...ilike...) が呼ばれる', async () => {
    const chain = makeChain([userRow])
    mockClient(chain)
    await getAdminUsers({ keyword: 'テスト' })
    expect(chain.or).toHaveBeenCalledWith(
      expect.stringContaining('ilike'),
    )
  })

  it('keyword に % が含まれる → エスケープされる', async () => {
    const chain = makeChain([])
    mockClient(chain)
    await getAdminUsers({ keyword: '100%' })
    const orArg = (chain.or as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(orArg).toContain('\\%')
  })

  it('keyword が空白のみ → or は呼ばれない', async () => {
    const chain = makeChain([userRow])
    mockClient(chain)
    await getAdminUsers({ keyword: '   ' })
    expect(chain.or).not.toHaveBeenCalled()
  })

  it('has_full_access=0（falsy）→ false に正規化される', async () => {
    const chain = makeChain([{ ...userRow, has_full_access: 0 }])
    mockClient(chain)
    const result = await getAdminUsers()
    expect(result[0].has_full_access).toBe(false)
  })

  it('DB エラー → [] + console.error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const chain = makeChain(null, { code: 'PGRST301', message: 'error' })
    mockClient(chain)
    const result = await getAdminUsers()
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
