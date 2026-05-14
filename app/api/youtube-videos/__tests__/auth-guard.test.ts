import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * P3-AUX-04：/api/youtube-videos/{import,sync} の認可ガード接続テスト
 *
 * requireAdmin 自体のロジックは admin-guard.test.ts で網羅済み。
 * 本テストは「route にガードが正しく接続されているか」のセキュリティ修正担保。
 *
 * 観点：
 * - 未ログイン → 401 でそのまま返却
 * - 一般ユーザー → 403 でそのまま返却
 * - 管理者正常系（業務ロジック進行）は YouTube API 呼び出しを伴うため本テストの対象外
 *   （業務ロジック自体のテストは Phase 4 UAT で扱う）
 */

vi.mock('@/app/lib/auth/admin-guard', async () => {
  const actual = await vi.importActual<typeof import('@/app/lib/auth/admin-guard')>(
    '@/app/lib/auth/admin-guard',
  )
  return {
    ...actual,
    requireAdmin: vi.fn(),
  }
})

// supabase / youtube-api / その他依存は requireAdmin で 401/403 が返れば呼ばれないため
// 最低限のモックのみ用意（呼ばれた場合は throw して assertion で検知）
vi.mock('@/app/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn(() => {
      throw new Error('supabase should not be called when guard fails')
    }),
  }),
}))

vi.mock('@/app/lib/youtube-api', () => ({
  fetchChannelVideos: vi.fn(() => {
    throw new Error('youtube-api should not be called when guard fails')
  }),
  fetchYouTubeVideoData: vi.fn(() => {
    throw new Error('youtube-api should not be called when guard fails')
  }),
}))

import { requireAdmin } from '@/app/lib/auth/admin-guard'
import { POST as importPOST } from '../import/route'
import { POST as syncPOST } from '../sync/route'

function makeRequest(body: unknown = {}): Request {
  return new Request('http://localhost/api/youtube-videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('POST /api/youtube-videos/import — 認可', () => {
  it('未ログイン（requireAdmin → 401）→ そのまま 401 unauthorized 返却', async () => {
    ;(requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 401,
      error: 'unauthorized',
    })

    const res = await importPOST(makeRequest({ maxResults: 10 }))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'unauthorized' })
  })

  it('一般ユーザー（requireAdmin → 403）→ そのまま 403 forbidden 返却', async () => {
    ;(requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 403,
      error: 'forbidden',
    })

    const res = await importPOST(makeRequest({ maxResults: 10 }))
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ error: 'forbidden' })
  })
})

describe('POST /api/youtube-videos/sync — 認可', () => {
  it('未ログイン（requireAdmin → 401）→ そのまま 401 unauthorized 返却', async () => {
    ;(requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 401,
      error: 'unauthorized',
    })

    const res = await syncPOST(makeRequest({ syncAll: true }))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'unauthorized' })
  })

  it('一般ユーザー（requireAdmin → 403）→ そのまま 403 forbidden 返却', async () => {
    ;(requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 403,
      error: 'forbidden',
    })

    const res = await syncPOST(makeRequest({ videoId: 'test-video' }))
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ error: 'forbidden' })
  })
})
