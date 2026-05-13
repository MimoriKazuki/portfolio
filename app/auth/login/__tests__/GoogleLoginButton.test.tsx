// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const signInWithOAuth = vi.fn().mockResolvedValue({ error: null })

vi.mock('@/app/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: { signInWithOAuth },
  })),
}))

vi.mock('lucide-react', () => ({
  Loader2: () => null,
}))

import GoogleLoginButton from '../GoogleLoginButton'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GoogleLoginButton — returnTo の redirectTo への橋渡し', () => {
  it('returnTo なし → signInWithOAuth の redirectTo がクエリなし /auth/callback', async () => {
    render(<GoogleLoginButton />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledOnce()
    })

    const call = signInWithOAuth.mock.calls[0][0]
    expect(call.provider).toBe('google')
    expect(call.options.redirectTo).toBe(`${window.location.origin}/auth/callback`)
  })

  it('returnTo=/e-learning/courses → redirectTo に redirect_to=%2Fe-learning%2Fcourses が付く', async () => {
    render(<GoogleLoginButton returnTo="/e-learning/courses" />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledOnce()
    })

    const call = signInWithOAuth.mock.calls[0][0]
    expect(call.options.redirectTo).toBe(
      `${window.location.origin}/auth/callback?redirect_to=%2Fe-learning%2Fcourses`
    )
  })
})
