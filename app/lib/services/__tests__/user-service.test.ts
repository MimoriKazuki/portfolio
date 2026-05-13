import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// supabase-js をモック。各テストで mockServiceClient() を呼んで挙動を設定する。
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@supabase/supabase-js'
import { isCorporateUserEmail, syncFromAuth, withdraw } from '../user-service'

// ----------------------------------------------------------------
// Supabase チェーンスタブ ビルダー
// ----------------------------------------------------------------

// corporate_users 用クエリチェーン：.from().select().eq().eq().limit() → { data }
function makeCorporateChain(data: unknown[]) {
  const limit = vi.fn().mockResolvedValue({ data, error: null })
  const eq2 = vi.fn(() => ({ limit }))
  const eq1 = vi.fn(() => ({ eq: eq2 }))
  const select = vi.fn(() => ({ eq: eq1 }))
  return { select }
}

// e_learning_users 用クエリチェーン（fetchExisting）：.from().select().eq().single() → result
function makeFetchChain(result: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(result)
  const eq = vi.fn(() => ({ single }))
  const select = vi.fn(() => ({ eq }))
  return { select }
}

// INSERT チェーン：.from().insert().select().single() → result
function makeInsertChain(result: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(result)
  const select = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select }))
  return { insert }
}

// UPDATE チェーン：.from().update().eq().select().single() → result
function makeUpdateChain(result: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(result)
  const select = vi.fn(() => ({ single }))
  const eq = vi.fn(() => ({ select }))
  const update = vi.fn(() => ({ eq }))
  return { update }
}

// UNIQUE 違反後の SELECT リトライ：.from().select().eq().single() → result
function makeRefetchChain(result: { data: unknown; error: unknown }) {
  return makeFetchChain(result)
}

// withdraw UPDATE チェーン：.from().update().eq() → { error }（select なし）
function makeWithdrawUpdateChain(error: unknown) {
  const eq = vi.fn().mockResolvedValue({ error })
  const update = vi.fn(() => ({ eq }))
  return { update }
}

type TableMock = {
  select?:
    | ReturnType<typeof makeFetchChain>['select']
    | ReturnType<typeof makeCorporateChain>['select']
  insert?: ReturnType<typeof makeInsertChain>['insert']
  update?:
    | ReturnType<typeof makeUpdateChain>['update']
    | ReturnType<typeof makeWithdrawUpdateChain>['update']
}

/**
 * `createClient` が返す supabase インスタンスを設定する。
 * tables: テーブル名 → 各操作のスタブのマップ。
 * from() 呼び出しはテーブル名で振り分けられる。
 */
function mockServiceClient(tables: Record<string, TableMock | TableMock[]>) {
  const callCounts: Record<string, number> = {}

  const from = vi.fn((tableName: string) => {
    const entry = tables[tableName]
    if (!entry) return {}

    if (Array.isArray(entry)) {
      const idx = callCounts[tableName] ?? 0
      callCounts[tableName] = idx + 1
      return entry[idx] ?? entry[entry.length - 1]
    }
    return entry
  })

  ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({ from })
  return { from }
}

// ----------------------------------------------------------------
// テスト共通セットアップ
// ----------------------------------------------------------------
beforeEach(() => {
  vi.resetAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
})

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
})

// ----------------------------------------------------------------
// isCorporateUserEmail
// ----------------------------------------------------------------
describe('isCorporateUserEmail', () => {
  it('空文字 → false（DB アクセスなし）', async () => {
    const result = await isCorporateUserEmail('')
    expect(result).toBe(false)
    expect(createClient).not.toHaveBeenCalled()
  })

  it('未登録メール → false', async () => {
    mockServiceClient({
      e_learning_corporate_users: makeCorporateChain([]),
    })
    expect(await isCorporateUserEmail('unknown@example.com')).toBe(false)
  })

  it('登録済かつ active な corporate_customers 配下メール → true', async () => {
    mockServiceClient({
      e_learning_corporate_users: makeCorporateChain([{ id: 'cu-1' }]),
    })
    expect(await isCorporateUserEmail('member@corp.com')).toBe(true)
  })
})

// ----------------------------------------------------------------
// syncFromAuth
// ----------------------------------------------------------------
const baseUser = {
  id: 'auth-001',
  email: 'user@example.com',
  user_metadata: { full_name: 'Test User', avatar_url: 'https://example.com/avatar.png' },
}

describe('syncFromAuth', () => {
  it('新規ユーザー（auth_user_id ヒットなし）→ INSERT（has_full_access=false）', async () => {
    mockServiceClient({
      // 1. isCorporateUserEmail
      e_learning_corporate_users: makeCorporateChain([]),
      e_learning_users: [
        // 2. fetchExisting → NOT_FOUND
        makeFetchChain({ data: null, error: { code: 'PGRST116' } }),
        // 3. INSERT
        makeInsertChain({ data: { id: 'eu-1', has_full_access: false }, error: null }),
      ],
    })

    const result = await syncFromAuth(baseUser)
    expect(result).toEqual({ id: 'eu-1', has_full_access: false })
  })

  it('新規ユーザーで企業ユーザー → INSERT（has_full_access=true）', async () => {
    mockServiceClient({
      e_learning_corporate_users: makeCorporateChain([{ id: 'cu-1' }]),
      e_learning_users: [
        makeFetchChain({ data: null, error: { code: 'PGRST116' } }),
        makeInsertChain({ data: { id: 'eu-2', has_full_access: true }, error: null }),
      ],
    })

    const result = await syncFromAuth(baseUser)
    expect(result).toEqual({ id: 'eu-2', has_full_access: true })
  })

  it('既存 deleted_at=null + 非企業 + has_full_access=false → noop（UPDATE 呼ばれない）', async () => {
    const { from } = mockServiceClient({
      e_learning_corporate_users: makeCorporateChain([]),
      e_learning_users: makeFetchChain({
        data: { id: 'eu-3', has_full_access: false, deleted_at: null },
        error: null,
      }),
    })

    const result = await syncFromAuth(baseUser)
    expect(result).toEqual({ id: 'eu-3', has_full_access: false })
    // e_learning_users への from 呼び出しは fetchExisting の 1 回のみ（UPDATE なし）
    const usersCalls = (from.mock.calls as string[][]).filter(([t]) => t === 'e_learning_users')
    expect(usersCalls).toHaveLength(1)
  })

  it('既存 deleted_at IS NOT NULL → 再活性化（deleted_at=null / is_active=true）', async () => {
    mockServiceClient({
      e_learning_corporate_users: makeCorporateChain([]),
      e_learning_users: [
        makeFetchChain({
          data: { id: 'eu-4', has_full_access: true, deleted_at: '2024-01-01T00:00:00Z' },
          error: null,
        }),
        makeUpdateChain({ data: { id: 'eu-4', has_full_access: true }, error: null }),
      ],
    })

    const result = await syncFromAuth(baseUser)
    expect(result).toEqual({ id: 'eu-4', has_full_access: true })
  })

  it('既存 deleted_at IS NOT NULL + 企業ユーザー → 再活性化 + has_full_access=true 昇格', async () => {
    mockServiceClient({
      e_learning_corporate_users: makeCorporateChain([{ id: 'cu-1' }]),
      e_learning_users: [
        makeFetchChain({
          data: { id: 'eu-5', has_full_access: false, deleted_at: '2024-01-01T00:00:00Z' },
          error: null,
        }),
        makeUpdateChain({ data: { id: 'eu-5', has_full_access: true }, error: null }),
      ],
    })

    const result = await syncFromAuth(baseUser)
    expect(result).toEqual({ id: 'eu-5', has_full_access: true })
  })

  it('既存 deleted_at=null + 企業ユーザー + has_full_access=false → has_full_access=true 昇格のみ', async () => {
    mockServiceClient({
      e_learning_corporate_users: makeCorporateChain([{ id: 'cu-1' }]),
      e_learning_users: [
        makeFetchChain({
          data: { id: 'eu-6', has_full_access: false, deleted_at: null },
          error: null,
        }),
        makeUpdateChain({ data: { id: 'eu-6', has_full_access: true }, error: null }),
      ],
    })

    const result = await syncFromAuth(baseUser)
    expect(result).toEqual({ id: 'eu-6', has_full_access: true })
  })

  it('UNIQUE 違反（code=23505）→ リトライ SELECT で結果取得', async () => {
    mockServiceClient({
      e_learning_corporate_users: makeCorporateChain([]),
      e_learning_users: [
        // fetchExisting → NOT_FOUND
        makeFetchChain({ data: null, error: { code: 'PGRST116' } }),
        // INSERT → UNIQUE 違反
        makeInsertChain({ data: null, error: { code: '23505', message: 'unique violation' } }),
        // リトライ SELECT → 成功
        makeRefetchChain({ data: { id: 'eu-7', has_full_access: false }, error: null }),
      ],
    })

    const result = await syncFromAuth(baseUser)
    expect(result).toEqual({ id: 'eu-7', has_full_access: false })
  })
})

// ----------------------------------------------------------------
// withdraw
// ----------------------------------------------------------------
describe('withdraw', () => {
  it('通常退会：deleted_at=null → UPDATE 成功 → { ok: true }', async () => {
    const { from } = mockServiceClient({
      e_learning_users: [
        // 1. fetch
        makeFetchChain({ data: { id: 'eu-10', deleted_at: null }, error: null }),
        // 2. update
        makeWithdrawUpdateChain(null),
      ],
    })

    const result = await withdraw('eu-10')
    expect(result).toEqual({ ok: true })

    // UPDATE に has_full_access・email が含まれないことを検証
    const updateCalls = (from.mock.results as { value: { update?: ReturnType<typeof vi.fn> } }[])
      .map((r) => r.value?.update)
      .filter(Boolean)
    expect(updateCalls).toHaveLength(1)
    const updateArg = updateCalls[0]!.mock.calls[0][0] as Record<string, unknown>
    expect(updateArg).toHaveProperty('deleted_at')
    expect(updateArg).toHaveProperty('display_name', null)
    expect(updateArg).toHaveProperty('avatar_url', null)
    expect(updateArg).toHaveProperty('is_active', false)
    expect(updateArg).not.toHaveProperty('has_full_access')
    expect(updateArg).not.toHaveProperty('email')
  })

  it('冪等性：deleted_at が既に non-null → UPDATE 呼ばれない → { ok: true }', async () => {
    const { from } = mockServiceClient({
      e_learning_users: makeFetchChain({
        data: { id: 'eu-11', deleted_at: '2024-01-01T00:00:00Z' },
        error: null,
      }),
    })

    const result = await withdraw('eu-11')
    expect(result).toEqual({ ok: true })

    // UPDATE が呼ばれていないことを確認
    const updateCalls = (from.mock.results as { value: { update?: ReturnType<typeof vi.fn> } }[])
      .map((r) => r.value?.update)
      .filter(Boolean)
    expect(updateCalls).toHaveLength(0)
  })

  it('fetch 失敗（user not found）→ throw Error("user_not_found")', async () => {
    mockServiceClient({
      e_learning_users: makeFetchChain({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      }),
    })

    await expect(withdraw('eu-99')).rejects.toThrow('user_not_found')
  })

  it('update 失敗 → throw Error("withdraw_failed")', async () => {
    mockServiceClient({
      e_learning_users: [
        makeFetchChain({ data: { id: 'eu-12', deleted_at: null }, error: null }),
        makeWithdrawUpdateChain({ code: '500', message: 'db error' }),
      ],
    })

    await expect(withdraw('eu-12')).rejects.toThrow('withdraw_failed')
  })

  it('成功時に console.info("[user-service] user withdrawn") が呼ばれる', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    mockServiceClient({
      e_learning_users: [
        makeFetchChain({ data: { id: 'eu-13', deleted_at: null }, error: null }),
        makeWithdrawUpdateChain(null),
      ],
    })

    await withdraw('eu-13')
    expect(infoSpy).toHaveBeenCalledWith(
      '[user-service] user withdrawn',
      expect.objectContaining({ auth_user_id: 'eu-13' })
    )

    infoSpy.mockRestore()
  })
})
