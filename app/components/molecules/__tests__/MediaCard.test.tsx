/**
 * @vitest-environment jsdom
 */
/**
 * MediaCard molecule のユニットテスト（2026-05-15 Kosuke 最終確定版）
 *
 * 観点：
 * - type='content' のみ サムネ左上に「単体動画」バッジが overlay 表示される
 * - type='course' 時はサムネ左上に何も表示されない（バッジ overlay なし）
 * - thumbnailUrl 有無で Image / PlayCircle 切替
 * - description（任意）の line-clamp-3 表示／非表示
 * - chapterCount / videoCount / duration / isFeatured は props 互換のため受け取るが UI 上は非表示
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode } & Record<string, unknown>) => (
    <a href={typeof href === 'string' ? href : String(href)} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock('@/app/lib/utils', () => ({
  cn: (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' '),
}))

import { MediaCard } from '../MediaCard'

const baseProps = {
  href: '/e-learning/lp/courses/dummy-ai-intro-free',
  title: 'AI 入門コース',
  thumbnailUrl: null as string | null,
  isFree: true,
  price: null as number | null,
}

describe('MediaCard molecule', () => {
  it('type="content" → サムネ左上に「単体動画」バッジ overlay が表示される', () => {
    render(<MediaCard {...baseProps} type="content" />)
    expect(screen.getByText('単体動画')).toBeInTheDocument()
  })

  it('type="course" → サムネ左上にバッジ overlay は表示されない', () => {
    render(<MediaCard {...baseProps} type="course" />)
    expect(screen.queryByText('単体動画')).not.toBeInTheDocument()
    expect(screen.queryByText('コース')).not.toBeInTheDocument()
  })

  it('thumbnailUrl null → PlayCircle フォールバック表示（Image 非描画）', () => {
    const { container } = render(<MediaCard {...baseProps} type="course" thumbnailUrl={null} />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0)
  })

  it('description あり → タイトル下に表示、null → 非表示', () => {
    const { rerender } = render(
      <MediaCard {...baseProps} type="course" description="この動画の説明" />,
    )
    expect(screen.getByText('この動画の説明')).toBeInTheDocument()

    rerender(<MediaCard {...baseProps} type="course" description={null} />)
    expect(screen.queryByText('この動画の説明')).not.toBeInTheDocument()
  })

  it('chapterCount/videoCount / duration / isFeatured を渡しても UI 上に表示されない（props 互換のみ）', () => {
    render(
      <MediaCard
        {...baseProps}
        type="course"
        chapterCount={3}
        videoCount={8}
        duration="12:34"
        isFeatured={true}
      />,
    )
    expect(screen.queryByText(/章 \//)).not.toBeInTheDocument()
    expect(screen.queryByText('12:34')).not.toBeInTheDocument()
    expect(screen.queryByText('注目')).not.toBeInTheDocument()
  })
})
