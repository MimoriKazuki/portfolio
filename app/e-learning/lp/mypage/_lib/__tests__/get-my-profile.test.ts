import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { getMyProfile } from '../get-my-profile'

// ----------------------------------------------------------------
// チェーンスタブ ビルダー
// ----------------------------------------------------------------

// .select().eq().maybeSingle() → { data, error }
function makeMaybySingleChain(data: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error })
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  return { select }
}

function mockClient(stub: ReturnType<typeof makeMaybySingleChain>) {
  const from = vi.fn(() => stub)
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({ from })
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ----------------------------------------------------------------
// getMyProfile
// ----------------------------------------------------------------
describe('getMyProfile', () => {
  const fullData = {
    id: 'eu-1',
    email: 'user@example.com',
    display_name: 'テストユーザー',
    avatar_url: 'https://example.com/avatar.jpg',
    has_full_access: true,
    created_at: '2026-01-01T00:00:00Z',
  }

  it('正常系：profile オブジェクトを返す', async () => {
    mockClient(makeMaybySingleChain(fullData))
    const result = await getMyProfile('auth-uid-1')
    expect(result).toEqual({
      id: 'eu-1',
      email: 'user@example.com',
      display_name: 'テストユーザー',
      avatar_url: 'https://example.com/avatar.jpg',
      has_full_access: true,
      created_at: '2026-01-01T00:00:00Z',
    })
  })

  it('has_full_access が true のとき true を返す', async () => {
    mockClient(makeMaybySingleChain({ ...fullData, has_full_access: true }))
    const result = await getMyProfile('auth-uid-1')
    expect(result!.has_full_access).toBe(true)
  })

  it('has_full_access が false のとき false を返す', async () => {
    mockClient(makeMaybySingleChain({ ...fullData, has_full_access: false }))
    const result = await getMyProfile('auth-uid-1')
    expect(result!.has_full_access).toBe(false)
  })

  it('email=null のとき null で返す', async () => {
    mockClient(makeMaybySingleChain({ ...fullData, email: null }))
    const result = await getMyProfile('auth-uid-1')
    expect(result!.email).toBeNull()
  })

  it('display_name=null のとき null で返す', async () => {
    mockClient(makeMaybySingleChain({ ...fullData, display_name: null }))
    const result = await getMyProfile('auth-uid-1')
    expect(result!.display_name).toBeNull()
  })

  it('avatar_url=null のとき null で返す', async () => {
    mockClient(makeMaybySingleChain({ ...fullData, avatar_url: null }))
    const result = await getMyProfile('auth-uid-1')
    expect(result!.avatar_url).toBeNull()
  })

  it('未登録ユーザー（data=null）→ null', async () => {
    mockClient(makeMaybySingleChain(null))
    const result = await getMyProfile('auth-uid-unknown')
    expect(result).toBeNull()
  })

  it('DB エラー → null + console.error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockClient(makeMaybySingleChain(null, { code: 'PGRST301', message: 'db error' }))
    const result = await getMyProfile('auth-uid-1')
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
