import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// @supabase/ssr のモック
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

import { createServerClient } from '@supabase/ssr'
import { updateSession } from '../middleware'

// NextRequest スタブを生成するヘルパー
function makeRequest(pathname: string, search = ''): NextRequest {
  const url = `http://localhost${pathname}${search}`
  const req = new NextRequest(url)
  return req
}

// createServerClient が返す supabase モックを設定するヘルパー
function mockSupabaseUser(user: object | null) {
  const getUser = vi.fn().mockResolvedValue({ data: { user } })
  ;(createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
    auth: { getUser },
  })
  return { getUser }
}

const SUPABASE_URL = 'https://example.supabase.co'
const SUPABASE_ANON_KEY = 'test-anon-key'

describe('updateSession / requiresAuth', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = SUPABASE_ANON_KEY
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  // ----------------------------------------------------------------
  // A. ガード不要（requiresAuth=false → そのまま通過）
  // ----------------------------------------------------------------
  describe('A: ガード不要パス（未ログインでも通過）', () => {
    const publicPaths = [
      '/',
      '/e-learning',
      '/projects',
      '/projects/abc',
      '/columns',
      '/columns/abc',
      '/documents',
      '/documents/abc',
      '/contacts',
    ]

    it.each(publicPaths)('パス %s はリダイレクトしない', async (pathname) => {
      mockSupabaseUser(null) // 未ログイン
      const req = makeRequest(pathname)
      const res = await updateSession(req)
      expect(res.status).not.toBe(307)
      expect(res.status).not.toBe(302)
      expect(res.headers.get('location')).toBeNull()
    })

    // 認証ページ自体・OAuth コールバックは createServerClient を呼ばずに通過
    it('/auth/login は createServerClient を呼ばず通過', async () => {
      const req = makeRequest('/auth/login')
      const res = await updateSession(req)
      expect(createServerClient).not.toHaveBeenCalled()
      expect(res.headers.get('location')).toBeNull()
    })

    it('/auth/callback?code=xxx は createServerClient を呼ばず通過', async () => {
      const req = makeRequest('/auth/callback', '?code=xxx')
      const res = await updateSession(req)
      expect(createServerClient).not.toHaveBeenCalled()
      expect(res.headers.get('location')).toBeNull()
    })

    it('/login は createServerClient を呼ばず通過', async () => {
      const req = makeRequest('/login')
      const res = await updateSession(req)
      expect(createServerClient).not.toHaveBeenCalled()
      expect(res.headers.get('location')).toBeNull()
    })

    it('/login/debug は createServerClient を呼ばず通過', async () => {
      const req = makeRequest('/login/debug')
      const res = await updateSession(req)
      expect(createServerClient).not.toHaveBeenCalled()
      expect(res.headers.get('location')).toBeNull()
    })

    it('/api/auth/logout は未ログインでもリダイレクトしない', async () => {
      mockSupabaseUser(null)
      const req = makeRequest('/api/auth/logout')
      const res = await updateSession(req)
      expect(res.headers.get('location')).toBeNull()
    })

    it('/api/auth/user は未ログインでもリダイレクトしない', async () => {
      mockSupabaseUser(null)
      const req = makeRequest('/api/auth/user')
      const res = await updateSession(req)
      expect(res.headers.get('location')).toBeNull()
    })

    it('/api/stripe/webhook は未ログインでもリダイレクトしない', async () => {
      // stripe webhook は matcher で除外されているが requiresAuth=false も確認
      mockSupabaseUser(null)
      const req = makeRequest('/api/stripe/webhook')
      const res = await updateSession(req)
      expect(res.headers.get('location')).toBeNull()
    })
  })

  // ----------------------------------------------------------------
  // B. ガード必要（未ログイン時 → /auth/login?returnTo=... リダイレクト）
  // ----------------------------------------------------------------
  describe('B: ガード必要パス（未ログイン → リダイレクト）', () => {
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
    ]

    it.each(guardedPaths)('パス %s は未ログイン時に /auth/login へリダイレクト', async (pathname) => {
      mockSupabaseUser(null)
      const req = makeRequest(pathname)
      const res = await updateSession(req)
      const location = res.headers.get('location')
      expect(location).not.toBeNull()
      expect(location).toContain('/auth/login')
      expect(location).toContain('returnTo=')
    })
  })

  // ----------------------------------------------------------------
  // C. ガード必要かつログイン済み（そのまま通過）
  // ----------------------------------------------------------------
  describe('C: ガード必要パス（ログイン済み → 通過）', () => {
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
    ]

    it.each(guardedPaths)('パス %s はログイン済みならリダイレクトしない', async (pathname) => {
      mockSupabaseUser({ id: 'user-001', email: 'user@example.com' })
      const req = makeRequest(pathname)
      const res = await updateSession(req)
      expect(res.headers.get('location')).toBeNull()
    })
  })

  // ----------------------------------------------------------------
  // D. リダイレクト時の returnTo クエリ
  // ----------------------------------------------------------------
  describe('D: returnTo クエリの形式', () => {
    it('/e-learning/courses?foo=bar へアクセス → returnTo に pathname+search が encodeURIComponent 形式で含まれる', async () => {
      mockSupabaseUser(null)
      const req = makeRequest('/e-learning/courses', '?foo=bar')
      const res = await updateSession(req)
      const location = res.headers.get('location')!
      expect(location).not.toBeNull()

      const redirectUrl = new URL(location)
      expect(redirectUrl.pathname).toBe('/auth/login')

      const returnTo = redirectUrl.searchParams.get('returnTo')
      expect(returnTo).toBe('/e-learning/courses?foo=bar')
    })

    it('/admin へアクセス（クエリなし） → returnTo=/admin', async () => {
      mockSupabaseUser(null)
      const req = makeRequest('/admin')
      const res = await updateSession(req)
      const location = res.headers.get('location')!
      const redirectUrl = new URL(location)
      expect(redirectUrl.searchParams.get('returnTo')).toBe('/admin')
    })
  })

  // ----------------------------------------------------------------
  // E. 環境変数未設定 → 認証チェックスキップ
  // ----------------------------------------------------------------
  describe('E: Supabase 環境変数未設定', () => {
    beforeEach(() => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })

    it('環境変数未設定の場合、createServerClient を呼ばずに supabaseResponse をそのまま返す', async () => {
      // ガード対象パスでも環境変数なしならリダイレクトしない
      const req = makeRequest('/e-learning/courses')
      const res = await updateSession(req)
      expect(createServerClient).not.toHaveBeenCalled()
      expect(res.headers.get('location')).toBeNull()
    })

    it('環境変数未設定・/admin アクセス → リダイレクトなし', async () => {
      const req = makeRequest('/admin')
      const res = await updateSession(req)
      expect(createServerClient).not.toHaveBeenCalled()
      expect(res.headers.get('location')).toBeNull()
    })
  })
})
