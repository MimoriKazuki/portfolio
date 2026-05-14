// @vitest-environment jsdom
import * as React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// ----------------------------------------------------------------
// next/navigation モック
// ----------------------------------------------------------------
const mockPush = vi.fn()
const mockReplace = vi.fn()
let mockSearchParamsString = ''

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => ({
    get: (key: string) => new URLSearchParams(mockSearchParamsString).get(key),
    toString: () => mockSearchParamsString,
  }),
  usePathname: () => '/e-learning/lp/courses/intro-ai',
}))

// ----------------------------------------------------------------
// PurchasePromptModalV2 モック（props キャプチャ用）
// ----------------------------------------------------------------
interface ModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  targetId: string
  title: string
  price: number | null
}

const capturedModalProps: { current: ModalProps | null } = { current: null }

vi.mock('@/app/e-learning/PurchasePromptModalV2', () => ({
  PurchasePromptModalV2: (props: ModalProps) => {
    capturedModalProps.current = props
    return props.open ? (
      <div data-testid="modal" data-open="true">
        <button onClick={() => props.onOpenChange(false)}>閉じる</button>
      </div>
    ) : null
  },
}))

// ----------------------------------------------------------------
// Button モック（シンプルなボタンとして扱う）
// ----------------------------------------------------------------
vi.mock('@/app/components/atoms/Button', () => ({
  Button: ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick}>{children}</button>
  ),
}))

import { CoursePurchaseCtaClient } from '../CoursePurchaseCtaClient'

const DEFAULT_PROPS = {
  courseId: 'course-1',
  courseSlug: 'intro-ai',
  courseTitle: 'AI 入門コース',
  price: 9800,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSearchParamsString = ''
  capturedModalProps.current = null
})

// ----------------------------------------------------------------
// テスト
// ----------------------------------------------------------------
describe('CoursePurchaseCtaClient', () => {
  it('「購入する」ボタンクリック → router.push が ?purchase=1 付き URL で呼ばれる', () => {
    render(<CoursePurchaseCtaClient {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByText('購入する'))
    expect(mockPush).toHaveBeenCalledOnce()
    const calledUrl: string = mockPush.mock.calls[0][0]
    expect(calledUrl).toContain('/e-learning/lp/courses/intro-ai')
    expect(calledUrl).toContain('purchase=1')
  })

  it('?purchase=1 なし → モーダル open=false（非表示）', () => {
    mockSearchParamsString = ''
    render(<CoursePurchaseCtaClient {...DEFAULT_PROPS} />)
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('?purchase=1 あり → モーダル open=true（表示）', () => {
    mockSearchParamsString = 'purchase=1'
    render(<CoursePurchaseCtaClient {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('modal')).toBeInTheDocument()
  })

  it('モーダル onOpenChange(false) → router.replace で ?purchase を除去した URL', () => {
    mockSearchParamsString = 'purchase=1'
    render(<CoursePurchaseCtaClient {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByText('閉じる'))
    expect(mockReplace).toHaveBeenCalledOnce()
    const calledUrl: string = mockReplace.mock.calls[0][0]
    expect(calledUrl).not.toContain('purchase')
    expect(calledUrl).toContain('/e-learning/lp/courses/intro-ai')
  })

  it('props の courseId が PurchasePromptModalV2 の targetId に渡る', () => {
    mockSearchParamsString = 'purchase=1'
    render(<CoursePurchaseCtaClient {...DEFAULT_PROPS} />)
    expect(capturedModalProps.current?.targetId).toBe('course-1')
  })

  it('props の courseTitle が PurchasePromptModalV2 の title に渡る', () => {
    mockSearchParamsString = 'purchase=1'
    render(<CoursePurchaseCtaClient {...DEFAULT_PROPS} />)
    expect(capturedModalProps.current?.title).toBe('AI 入門コース')
  })

  it('props の price が PurchasePromptModalV2 の price に渡る', () => {
    mockSearchParamsString = 'purchase=1'
    render(<CoursePurchaseCtaClient {...DEFAULT_PROPS} />)
    expect(capturedModalProps.current?.price).toBe(9800)
  })

  it('price=null のとき価格表示がない', () => {
    render(<CoursePurchaseCtaClient {...DEFAULT_PROPS} price={null} />)
    expect(screen.queryByText(/¥/)).not.toBeInTheDocument()
  })

  it('price が設定されているとき価格表示がある', () => {
    render(<CoursePurchaseCtaClient {...DEFAULT_PROPS} price={9800} />)
    expect(screen.getByText('¥9,800')).toBeInTheDocument()
  })
})
