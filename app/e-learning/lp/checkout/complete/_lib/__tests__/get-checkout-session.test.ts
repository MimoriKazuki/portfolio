import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/lib/stripe/client', () => ({
  getStripe: vi.fn(),
}))

import { getStripe } from '@/app/lib/stripe/client'
import { getCheckoutSessionTarget } from '../get-checkout-session'

function mockRetrieve(result: object | null, error?: Error) {
  const retrieve = error
    ? vi.fn().mockRejectedValue(error)
    : vi.fn().mockResolvedValue(result)
  ;(getStripe as ReturnType<typeof vi.fn>).mockReturnValue({
    checkout: { sessions: { retrieve } },
  })
  return { retrieve }
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('getCheckoutSessionTarget', () => {
  it('新形式 target_type=course → kind=course + targetId + userId', async () => {
    mockRetrieve({
      metadata: { user_id: 'eu-001', target_type: 'course', target_id: 'course-001' },
    })
    const result = await getCheckoutSessionTarget('cs_test_001')
    expect(result).toEqual({ kind: 'course', targetId: 'course-001', userId: 'eu-001' })
  })

  it('新形式 target_type=content → kind=content + targetId + userId', async () => {
    mockRetrieve({
      metadata: { user_id: 'eu-002', target_type: 'content', target_id: 'content-001' },
    })
    const result = await getCheckoutSessionTarget('cs_test_002')
    expect(result).toEqual({ kind: 'content', targetId: 'content-001', userId: 'eu-002' })
  })

  it('旧形式 metadata（userId のみ）→ kind=unknown', async () => {
    mockRetrieve({
      metadata: { userId: 'eu-legacy-001' },
    })
    const result = await getCheckoutSessionTarget('cs_legacy_001')
    expect(result).toEqual({ kind: 'unknown' })
  })

  it('metadata が null → kind=unknown', async () => {
    mockRetrieve({ metadata: null })
    const result = await getCheckoutSessionTarget('cs_null_001')
    expect(result).toEqual({ kind: 'unknown' })
  })

  it('target_type が course/content 以外の文字列 → kind=unknown', async () => {
    mockRetrieve({
      metadata: { user_id: 'eu-001', target_type: 'subscription', target_id: 'plan-001' },
    })
    const result = await getCheckoutSessionTarget('cs_test_003')
    expect(result).toEqual({ kind: 'unknown' })
  })

  it('user_id が空文字 → kind=unknown', async () => {
    mockRetrieve({
      metadata: { user_id: '', target_type: 'course', target_id: 'course-001' },
    })
    const result = await getCheckoutSessionTarget('cs_test_004')
    expect(result).toEqual({ kind: 'unknown' })
  })

  it('Stripe API エラー（throw）→ kind=unknown + console.error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockRetrieve(null, new Error('Stripe API error'))
    const result = await getCheckoutSessionTarget('cs_err_001')
    expect(result).toEqual({ kind: 'unknown' })
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
