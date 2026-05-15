/**
 * @vitest-environment jsdom
 */
/**
 * MediaCard molecule のユニットテスト（unittest-mate 指示・B002 統合一覧用）
 *
 * 観点：
 * - type='course' / 'content' で種別バッジが切り替わる
 * - thumbnailUrl 有無で Image / PlayCircle 切替
 * - isFeatured バッジ表示制御
 * - メタ表示の type 別分岐（course → N章/M動画、content → duration）
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
  it('type="course" → 種別バッジに「コース」が表示される', () => {
    render(<MediaCard {...baseProps} type="course" />)
    expect(screen.getByText('コース')).toBeInTheDocument()
    expect(screen.queryByText('動画')).not.toBeInTheDocument()
  })

  it('type="content" → 種別バッジに「動画」が表示される', () => {
    render(<MediaCard {...baseProps} type="content" />)
    expect(screen.getByText('動画')).toBeInTheDocument()
    expect(screen.queryByText('コース')).not.toBeInTheDocument()
  })

  it('thumbnailUrl null → PlayCircle フォールバック表示（Image 非描画）', () => {
    const { container } = render(<MediaCard {...baseProps} type="course" thumbnailUrl={null} />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0)
  })

  it('isFeatured=true → 「注目」バッジ表示、isFeatured=false → 非表示', () => {
    const { rerender } = render(
      <MediaCard {...baseProps} type="course" isFeatured={true} />,
    )
    expect(screen.getByText('注目')).toBeInTheDocument()

    rerender(<MediaCard {...baseProps} type="course" isFeatured={false} />)
    expect(screen.queryByText('注目')).not.toBeInTheDocument()
  })

  it('type="course" + chapterCount/videoCount → メタ表示、type="content" + duration → duration 表示', () => {
    const { rerender } = render(
      <MediaCard {...baseProps} type="course" chapterCount={3} videoCount={8} />,
    )
    expect(screen.getByText('3 章 / 8 動画')).toBeInTheDocument()

    rerender(<MediaCard {...baseProps} type="content" duration="12:34" />)
    expect(screen.getByText('12:34')).toBeInTheDocument()
    expect(screen.queryByText(/章 \//)).not.toBeInTheDocument()
  })
})
