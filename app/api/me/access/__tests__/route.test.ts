import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/app/lib/services/access-service', () => ({
  getViewerAccess: vi.fn(),
}))

import { createClient } from '@/app/lib/supabase/server'
import { getViewerAccess } from '@/app/lib/services/access-service'
import { GET } from '../route'

function mockSupabaseClient({
  user,
  eLearningUser,
}: {
  user: object | null
  eLearningUser: object | null
}) {
  const getUser = vi.fn().mockResolvedValue({ data: { user } })
  const maybeSingle = vi.fn().mockResolvedValue({ data: eLearningUser, error: null })
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select }))
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: { getUser },
    from,
  })
  return { getUser, from, maybeSingle }
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('GET /api/me/access', () => {
  it('未認証（user=null）→ 401 + error.code=UNAUTHORIZED', async () => {
    mockSupabaseClient({ user: null, eLearningUser: null })

    const res = await GET()
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: { code: 'UNAUTHORIZED' } })
  })

  it('e_learning_users 未登録（eLearningUser=null）→ 200 + 空アクセス', async () => {
    mockSupabaseClient({ user: { id: 'auth-001' }, eLearningUser: null })

    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      has_full_access: false,
      purchased_course_ids: [],
      purchased_content_ids: [],
    })
    expect(getViewerAccess).not.toHaveBeenCalled()
  })

  it('認証済かつ登録済 → getViewerAccess の戻り値をそのまま返す', async () => {
    mockSupabaseClient({ user: { id: 'auth-001' }, eLearningUser: { id: 'eu-001' } })
    const accessData = {
      has_full_access: true,
      purchased_course_ids: ['c-001'],
      purchased_content_ids: ['cnt-001'],
    }
    ;(getViewerAccess as ReturnType<typeof vi.fn>).mockResolvedValue(accessData)

    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(accessData)
    expect(getViewerAccess).toHaveBeenCalledWith('eu-001')
  })

  it('Cache-Control: no-store ヘッダが付与される', async () => {
    mockSupabaseClient({ user: { id: 'auth-001' }, eLearningUser: { id: 'eu-001' } })
    ;(getViewerAccess as ReturnType<typeof vi.fn>).mockResolvedValue({
      has_full_access: false,
      purchased_course_ids: [],
      purchased_content_ids: [],
    })

    const res = await GET()
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('e_learning_users 未登録の場合は Cache-Control ヘッダなし（暫定アクセスは no-store 対象外）', async () => {
    mockSupabaseClient({ user: { id: 'auth-001' }, eLearningUser: null })

    const res = await GET()
    expect(res.status).toBe(200)
    // no-store ヘッダは登録済ユーザーへの応答にのみ付与される
    expect(res.headers.get('Cache-Control')).toBeNull()
  })
})
