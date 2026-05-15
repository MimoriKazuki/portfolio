// @vitest-environment jsdom
import * as React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// ----------------------------------------------------------------
// useTransition モック：startTransition が即座に async fn を実行
// ----------------------------------------------------------------
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof React>('react')
  return {
    ...actual,
    useTransition: () => {
      const [isPending, setIsPending] = actual.useState(false)
      const startTransition = async (fn: () => Promise<void>) => {
        setIsPending(true)
        await fn()
        setIsPending(false)
      }
      return [isPending, startTransition] as const
    },
  }
})

// ----------------------------------------------------------------
// toggle-bookmark Server Action モック
// ----------------------------------------------------------------
const mockToggleBookmarkAction = vi.fn()

vi.mock(
  '@/app/e-learning/lp/courses/[slug]/_actions/toggle-bookmark',
  () => ({
    toggleBookmarkAction: (...args: unknown[]) => mockToggleBookmarkAction(...args),
  }),
)

// ----------------------------------------------------------------
// lucide-react モック（Bookmark アイコン）
// ----------------------------------------------------------------
vi.mock('lucide-react', () => ({
  Bookmark: ({ className, 'aria-hidden': ariaHidden }: { className?: string; 'aria-hidden'?: boolean }) => (
    <svg data-testid="bookmark-icon" className={className} aria-hidden={ariaHidden} />
  ),
}))

// ----------------------------------------------------------------
// @/app/lib/utils モック
// ----------------------------------------------------------------
vi.mock('@/app/lib/utils', () => ({
  cn: (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' '),
}))

import { BookmarkToggleClient } from '../BookmarkToggleClient'

const DEFAULT_PROPS = {
  courseId: 'course-1',
  courseSlug: 'intro-ai',
  initialBookmarked: false,
  initialBookmarkId: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

// ----------------------------------------------------------------
// テスト
// ----------------------------------------------------------------

describe('BookmarkToggleClient — 初期表示', () => {
  it('initialBookmarked=false → 「ブックマーク」表示・aria-pressed=false', () => {
    render(<BookmarkToggleClient {...DEFAULT_PROPS} />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    expect(btn).toHaveTextContent('ブックマーク')
    expect(btn).not.toHaveTextContent('ブックマーク済み')
  })

  it('initialBookmarked=true → 「ブックマーク済み」表示・aria-pressed=true', () => {
    render(
      <BookmarkToggleClient
        {...DEFAULT_PROPS}
        initialBookmarked={true}
        initialBookmarkId="bm-1"
      />,
    )
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(btn).toHaveTextContent('ブックマーク済み')
  })
})

describe('BookmarkToggleClient — Server Action 成功', () => {
  it('クリック → action 成功 → ブックマーク済み状態に更新', async () => {
    mockToggleBookmarkAction.mockResolvedValue({
      ok: true,
      isBookmarked: true,
      bookmarkId: 'bm-new',
    })
    render(<BookmarkToggleClient {...DEFAULT_PROPS} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button')).toHaveTextContent('ブックマーク済み')
  })

  it('ブックマーク済みクリック → action 成功 → 未ブックマーク状態に更新', async () => {
    mockToggleBookmarkAction.mockResolvedValue({
      ok: true,
      isBookmarked: false,
      bookmarkId: null,
    })
    render(
      <BookmarkToggleClient
        {...DEFAULT_PROPS}
        initialBookmarked={true}
        initialBookmarkId="bm-1"
      />,
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button')).toHaveTextContent('ブックマーク')
    expect(screen.getByRole('button')).not.toHaveTextContent('ブックマーク済み')
  })
})

describe('BookmarkToggleClient — Server Action 失敗', () => {
  it('action 失敗 → ロールバック（元の状態に戻る）', async () => {
    mockToggleBookmarkAction.mockResolvedValue({ ok: false, error: 'DB_ERROR' })
    render(<BookmarkToggleClient {...DEFAULT_PROPS} initialBookmarked={false} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button')).toHaveTextContent('ブックマーク')
  })

  it('action 失敗 → alert が呼ばれる', async () => {
    mockToggleBookmarkAction.mockResolvedValue({ ok: false, error: 'UNAUTHORIZED' })
    render(<BookmarkToggleClient {...DEFAULT_PROPS} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })

    expect(window.alert).toHaveBeenCalledOnce()
  })
})
