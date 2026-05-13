import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
      })),
    })),
  })),
}))

import { createServerClient } from '@supabase/ssr'
import { GET } from '../route'

const ORIGIN = 'http://localhost:3000'

function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL(`${ORIGIN}/auth/callback`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new NextRequest(url.toString())
}

function mockExchangeSuccess(user: object | null = null) {
  const exchangeCodeForSession = vi.fn().mockResolvedValue({
    data: { user },
    error: null,
  })
  const from = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      })),
    })),
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
  }))
  ;(createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
    auth: { exchangeCodeForSession },
    from,
  })
  return { exchangeCodeForSession }
}

beforeEach(() => {
  vi.resetAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
})

describe('/auth/callback GET', () => {
  describe('内部 redirect_to は許容', () => {
    it('redirect_to=/e-learning/courses → ${origin}/e-learning/courses にリダイレクト', async () => {
      mockExchangeSuccess(null)
      const res = await GET(makeRequest({ code: 'xxx', redirect_to: '/e-learning/courses' }))
      expect(res.headers.get('location')).toBe(`${ORIGIN}/e-learning/courses`)
    })

    it('redirect_to=/admin?foo=bar → 内部パスとして許容', async () => {
      mockExchangeSuccess(null)
      const res = await GET(makeRequest({ code: 'xxx', redirect_to: '/admin?foo=bar' }))
      expect(res.headers.get('location')).toBe(`${ORIGIN}/admin?foo=bar`)
    })
  })

  describe('外部 redirect_to は /e-learning にフォールバック', () => {
    const externalTargets = [
      '//evil.com',
      'http://evil.com/path',
      'javascript:alert(1)',
      // バックスラッシュ始まり（security 再チェック [注意] 対応）
      '/\\evil.com',
    ]

    it.each(externalTargets)('redirect_to=%s → /e-learning フォールバック', async (target) => {
      mockExchangeSuccess(null)
      const res = await GET(makeRequest({ code: 'xxx', redirect_to: target }))
      expect(res.headers.get('location')).toBe(`${ORIGIN}/e-learning`)
    })
  })

  it('code なし + error=access_denied → /auth/login?error=oauth_error', async () => {
    const res = await GET(makeRequest({ error: 'access_denied' }))
    expect(res.headers.get('location')).toBe(`${ORIGIN}/auth/login?error=oauth_error`)
  })

  it('code なし + redirect_to=/legit → ${origin}/legit', async () => {
    const res = await GET(makeRequest({ redirect_to: '/legit' }))
    expect(res.headers.get('location')).toBe(`${ORIGIN}/legit`)
  })

  it('code あり + exchangeCodeForSession 成功 → cookie 付き response を返す', async () => {
    const { exchangeCodeForSession } = mockExchangeSuccess({ id: 'user-001', email: 'user@example.com' })
    const res = await GET(makeRequest({ code: 'valid-code' }))
    expect(exchangeCodeForSession).toHaveBeenCalledWith('valid-code')
    // エラーなく完了し、/e-learning（デフォルト）へのリダイレクト
    expect(res.headers.get('location')).toBe(`${ORIGIN}/e-learning`)
  })
})
