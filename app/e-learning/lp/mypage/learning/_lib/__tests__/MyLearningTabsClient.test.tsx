// @vitest-environment jsdom
import * as React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// ----------------------------------------------------------------
// next/navigation モック
// ----------------------------------------------------------------
const mockPush = vi.fn()
let mockSearchParamsString = ''

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => new URLSearchParams(mockSearchParamsString).get(key),
    toString: () => mockSearchParamsString,
  }),
  usePathname: () => '/e-learning/lp/mypage/learning',
}))

vi.mock('@/app/lib/utils', () => ({
  cn: (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' '),
}))

import { MyLearningTabsClient } from '../MyLearningTabsClient'

beforeEach(() => {
  vi.clearAllMocks()
  mockSearchParamsString = ''
})

describe('MyLearningTabsClient', () => {
  it('activeTab="purchased" のとき「購入済み」が aria-selected="true"', () => {
    render(<MyLearningTabsClient activeTab="purchased" />)
    const purchasedBtn = screen.getByRole('tab', { name: '購入済み' })
    const bookmarkedBtn = screen.getByRole('tab', { name: 'ブックマーク済み' })
    expect(purchasedBtn).toHaveAttribute('aria-selected', 'true')
    expect(bookmarkedBtn).toHaveAttribute('aria-selected', 'false')
  })

  it('activeTab="bookmarked" のとき「ブックマーク済み」が aria-selected="true"', () => {
    render(<MyLearningTabsClient activeTab="bookmarked" />)
    expect(screen.getByRole('tab', { name: 'ブックマーク済み' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: '購入済み' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('「ブックマーク済み」クリック → URL に tab=bookmarked が追加される', () => {
    render(<MyLearningTabsClient activeTab="purchased" />)
    fireEvent.click(screen.getByRole('tab', { name: 'ブックマーク済み' }))
    expect(mockPush).toHaveBeenCalledOnce()
    const url = mockPush.mock.calls[0][0] as string
    expect(url).toContain('tab=bookmarked')
  })

  it('「購入済み」クリック → URL から tab パラメータが削除される（既定省略）', () => {
    mockSearchParamsString = 'tab=bookmarked'
    render(<MyLearningTabsClient activeTab="bookmarked" />)
    fireEvent.click(screen.getByRole('tab', { name: '購入済み' }))
    expect(mockPush).toHaveBeenCalledOnce()
    const url = mockPush.mock.calls[0][0] as string
    expect(url).not.toContain('tab=')
  })
})
