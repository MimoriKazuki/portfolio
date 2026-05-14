import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

import { createServerClient } from '@supabase/ssr'
import { updateSession } from '../middleware'

function makeRequest(pathname: string, search = ''): NextRequest {
  return new NextRequest(`http://localhost${pathname}${search}`)
}

function mockSupabaseUser(user: object | null) {
  const getUser = vi.fn().mockResolvedValue({ data: { user } })
  ;(createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
    auth: { getUser },
  })
}

const SUPABASE_URL = 'https://example.supabase.co'
const SUPABASE_ANON_KEY = 'test-anon-key'

describe('updateSession / requiresAuth', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = SUPABASE_ANON_KEY
    process.env.ADMIN_EMAIL = 'admin@example.com'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    delete process.env.ADMIN_EMAIL
  })

  describe('A: ガード不要パス（未ログインでも通過）', () => {
    const publicPaths = [
      '/',
      '/e-learning',
      '/e-learning/lp', // B001 新 LP（screens.md「不要（未ログイン）」に従う）
      '/projects',
      '/projects/abc',
      '/columns',
      '/columns/abc',
      '/documents',
      '/documents/abc',
      '/contacts',
    ]

    it.each(publicPaths)('パス %s はリダイレクトしない', async (pathname) => {
      mockSupabaseUser(null)
      const res = await updateSession(makeRequest(pathname))
      expect(res.headers.get('location')).toBeNull()
    })

    it('/auth/login は createServerClient を呼ばず通過', async () => {
      const res = await updateSession(makeRequest('/auth/login'))
      expect(createServerClient).not.toHaveBeenCalled()
      expect(res.headers.get('location')).toBeNull()
    })

    it('/auth/callback?code=xxx は createServerClient を呼ばず通過', async () => {
      const res = await updateSession(makeRequest('/auth/callback', '?code=xxx'))
      expect(createServerClient).not.toHaveBeenCalled()
      expect(res.headers.get('location')).toBeNull()
    })

    it('/login は createServerClient を呼ばず通過', async () => {
      const res = await updateSession(makeRequest('/login'))
      expect(createServerClient).not.toHaveBeenCalled()
      expect(res.headers.get('location')).toBeNull()
    })

    it('/login/debug は createServerClient を呼ばず通過', async () => {
      const res = await updateSession(makeRequest('/login/debug'))
      expect(createServerClient).not.toHaveBeenCalled()
      expect(res.headers.get('location')).toBeNull()
    })

    it('/api/auth/logout は未ログインでもリダイレクトしない', async () => {
      mockSupabaseUser(null)
      const res = await updateSession(makeRequest('/api/auth/logout'))
      expect(res.headers.get('location')).toBeNull()
    })

    it('/api/auth/user は未ログインでもリダイレクトしない', async () => {
      mockSupabaseUser(null)
      const res = await updateSession(makeRequest('/api/auth/user'))
      expect(res.headers.get('location')).toBeNull()
    })

    it('/api/stripe/webhook は未ログインでもリダイレクトしない', async () => {
      mockSupabaseUser(null)
      const res = await updateSession(makeRequest('/api/stripe/webhook'))
      expect(res.headers.get('location')).toBeNull()
    })
  })

  describe('B: ガード必要パス（未ログイン → リダイレクト）', () => {
    const guardedPaths = [
      '/admin',
      '/admin/customers',
      '/e-learning/courses',
      '/e-learning/courses/ai-basic',
      '/e-learning/abc-123',
      '/e-learning/lp/courses', // /e-learning/lp 配下はガード（screens.md 通り）
      '/e-learning/lp/videos',
      '/e-learning/lp/mypage',
      '/e-learning/lp/checkout/complete',
      '/play/xxx',
      '/videos/yyy',
      '/complete',
      '/complete/abc',
      '/api/checkout',
      '/api/me/withdraw',
      '/api/admin/customers/xxx/status',
      '/api/admin/corporate-customers',
    ]

    it.each(guardedPaths)('パス %s は未ログイン時に /auth/login へリダイレクト', async (pathname) => {
      mockSupabaseUser(null)
      const res = await updateSession(makeRequest(pathname))
      const location = res.headers.get('location')
      expect(location).not.toBeNull()
      expect(location).toContain('/auth/login')
      expect(location).toContain('returnTo=')
    })
  })

  describe('C: ガード必要パス（管理者ログイン済み → 通過）', () => {
    const guardedPaths = [
      '/admin',
      '/admin/customers',
      '/e-learning/courses',
      '/e-learning/courses/ai-basic',
      '/e-learning/abc-123',
      '/play/xxx',
      '/videos/yyy',
      '/complete',
      '/complete/abc',
      '/api/checkout',
      '/api/me/withdraw',
      '/api/admin/customers/xxx/status',
      '/api/admin/corporate-customers',
    ]

    it.each(guardedPaths)('パス %s は管理者ならリダイレクトしない', async (pathname) => {
      mockSupabaseUser({ id: 'admin-001', email: 'admin@example.com' })
      const res = await updateSession(makeRequest(pathname))
      expect(res.headers.get('location')).toBeNull()
    })
  })

  describe('D: 認証済み非管理者の管理パスへのアクセス', () => {
    const nonAdminUser = { id: 'user-001', email: 'user@example.com' }

    it('/admin → /e-learning へリダイレクト', async () => {
      mockSupabaseUser(nonAdminUser)
      const res = await updateSession(makeRequest('/admin'))
      const location = res.headers.get('location')
      expect(location).not.toBeNull()
      expect(location).toContain('/e-learning')
    })

    it('/admin/customers → /e-learning へリダイレクト', async () => {
      mockSupabaseUser(nonAdminUser)
      const res = await updateSession(makeRequest('/admin/customers'))
      const location = res.headers.get('location')
      expect(location).not.toBeNull()
      expect(location).toContain('/e-learning')
    })

    it('/api/admin/foo → 403 JSON', async () => {
      mockSupabaseUser(nonAdminUser)
      const res = await updateSession(makeRequest('/api/admin/foo'))
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body).toEqual({ error: 'forbidden' })
    })

    it('/api/admin/customers/xxx/status → 403 JSON', async () => {
      mockSupabaseUser(nonAdminUser)
      const res = await updateSession(makeRequest('/api/admin/customers/xxx/status'))
      expect(res.status).toBe(403)
    })

    it('ADMIN_EMAIL 該当 → /admin 通過', async () => {
      mockSupabaseUser({ id: 'admin-001', email: 'admin@example.com' })
      const res = await updateSession(makeRequest('/admin'))
      expect(res.headers.get('location')).toBeNull()
    })

    it('ADMIN_EMAIL 該当 → /api/admin/foo 通過', async () => {
      mockSupabaseUser({ id: 'admin-001', email: 'admin@example.com' })
      const res = await updateSession(makeRequest('/api/admin/foo'))
      expect(res.status).not.toBe(403)
      expect(res.headers.get('location')).toBeNull()
    })
  })

  describe('E: returnTo クエリの形式', () => {
    it('/e-learning/courses?foo=bar → returnTo に pathname+search が含まれる', async () => {
      mockSupabaseUser(null)
      const res = await updateSession(makeRequest('/e-learning/courses', '?foo=bar'))
      const location = res.headers.get('location')!
      const redirectUrl = new URL(location)
      expect(redirectUrl.pathname).toBe('/auth/login')
      expect(redirectUrl.searchParams.get('returnTo')).toBe('/e-learning/courses?foo=bar')
    })

    it('/admin → returnTo=/admin', async () => {
      mockSupabaseUser(null)
      const res = await updateSession(makeRequest('/admin'))
      const location = res.headers.get('location')!
      const redirectUrl = new URL(location)
      expect(redirectUrl.searchParams.get('returnTo')).toBe('/admin')
    })
  })

  describe('F: Supabase 環境変数未設定', () => {
    beforeEach(() => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })

    it('createServerClient を呼ばずに supabaseResponse をそのまま返す', async () => {
      const res = await updateSession(makeRequest('/e-learning/courses'))
      expect(createServerClient).not.toHaveBeenCalled()
      expect(res.headers.get('location')).toBeNull()
    })

    it('/admin アクセス → リダイレクトなし', async () => {
      const res = await updateSession(makeRequest('/admin'))
      expect(createServerClient).not.toHaveBeenCalled()
      expect(res.headers.get('location')).toBeNull()
    })
  })
})
