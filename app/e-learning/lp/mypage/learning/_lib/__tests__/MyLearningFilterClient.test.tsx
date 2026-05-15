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

vi.mock('@/app/components/atoms/Checkbox', () => ({
  Checkbox: ({
    id,
    checked,
    onCheckedChange,
  }: {
    id: string
    checked: boolean
    onCheckedChange: (next: boolean) => void
  }) => (
    <input
      type="checkbox"
      id={id}
      data-testid={id}
      checked={checked}
      onChange={() => onCheckedChange(!checked)}
    />
  ),
}))

vi.mock('@/app/components/atoms/Label', () => ({
  Label: ({
    children,
    htmlFor,
  }: {
    children: React.ReactNode
    htmlFor: string
  }) => <label htmlFor={htmlFor}>{children}</label>,
}))

import { MyLearningFilterClient } from '../MyLearningFilterClient'

const NO_CATEGORIES: never[] = []
const CATEGORIES = [
  { id: 'cat-1', name: 'AI 基礎' },
  { id: 'cat-2', name: 'LLM' },
]

beforeEach(() => {
  vi.clearAllMocks()
  mockSearchParamsString = ''
})

describe('MyLearningFilterClient — 種別フィルタ', () => {
  it('種別チェックボックスをオンにすると URL types に "course" が追加される', () => {
    render(<MyLearningFilterClient categories={NO_CATEGORIES} />)
    fireEvent.click(screen.getByTestId('mylearning-type-course'))
    expect(mockPush).toHaveBeenCalledOnce()
    const url = mockPush.mock.calls[0][0] as string
    expect(url).toContain('types=course')
  })

  it('既に course が選択されているとき再クリックで URL から types を削除（全解除）', () => {
    mockSearchParamsString = 'types=course'
    render(<MyLearningFilterClient categories={NO_CATEGORIES} />)
    fireEvent.click(screen.getByTestId('mylearning-type-course'))
    expect(mockPush).toHaveBeenCalledOnce()
    const url = mockPush.mock.calls[0][0] as string
    expect(url).not.toContain('types=')
  })

  it('「単体動画」チェックボックスをオンにすると URL types に "content" が追加される', () => {
    render(<MyLearningFilterClient categories={NO_CATEGORIES} />)
    fireEvent.click(screen.getByTestId('mylearning-type-content'))
    expect(mockPush).toHaveBeenCalledOnce()
    const url = mockPush.mock.calls[0][0] as string
    expect(url).toContain('types=content')
  })
})

describe('MyLearningFilterClient — カテゴリフィルタ', () => {
  it('カテゴリをオンにすると URL categories にそのIDが追加される', () => {
    render(<MyLearningFilterClient categories={CATEGORIES} />)
    fireEvent.click(screen.getByTestId('mylearning-category-cat-1'))
    expect(mockPush).toHaveBeenCalledOnce()
    const url = mockPush.mock.calls[0][0] as string
    expect(url).toContain('categories=cat-1')
  })

  it('複数カテゴリ選択で URL categories がカンマ区切りになる', () => {
    mockSearchParamsString = 'categories=cat-1'
    render(<MyLearningFilterClient categories={CATEGORIES} />)
    fireEvent.click(screen.getByTestId('mylearning-category-cat-2'))
    expect(mockPush).toHaveBeenCalledOnce()
    const url = mockPush.mock.calls[0][0] as string
    expect(url).toContain('categories=cat-1%2Ccat-2')
  })

  it('categories 空配列のとき カテゴリセクションが表示されない', () => {
    render(<MyLearningFilterClient categories={NO_CATEGORIES} />)
    expect(screen.queryByText('カテゴリ')).not.toBeInTheDocument()
  })

  it('全解除（チェック済みをオフ）で URL から categories パラメータが削除される', () => {
    mockSearchParamsString = 'categories=cat-1'
    render(<MyLearningFilterClient categories={CATEGORIES} />)
    fireEvent.click(screen.getByTestId('mylearning-category-cat-1'))
    expect(mockPush).toHaveBeenCalledOnce()
    const url = mockPush.mock.calls[0][0] as string
    expect(url).not.toContain('categories=')
  })
})
