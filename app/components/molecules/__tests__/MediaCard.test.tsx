/**
 * @vitest-environment jsdom
 */
/**
 * MediaCard molecule のユニットテスト（2026-05-15 Kosuke フィードバック反映後）
 *
 * 観点：
 * - type='course' / 'content' で下段右に「コース」「単体動画」テキストが切り替わる
 * - thumbnailUrl 有無で Image / PlayCircle 切替
 * - サムネにバッジ overlay がない（左上の種別バッジ / 右上の注目バッジは UI から除去）
 * - description / chapterCount / videoCount / duration は props 互換のため受け取るが UI 上は非表示
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
  it('type="course" → 下段右に「コース」テキストが表示される', () => {
    render(<MediaCard {...baseProps} type="course" />)
    expect(screen.getByText('コース')).toBeInTheDocument()
    expect(screen.queryByText('単体動画')).not.toBeInTheDocument()
  })

  it('type="content" → 下段右に「単体動画」テキストが表示される', () => {
    render(<MediaCard {...baseProps} type="content" />)
    expect(screen.getByText('単体動画')).toBeInTheDocument()
    expect(screen.queryByText('コース')).not.toBeInTheDocument()
  })

  it('thumbnailUrl null → PlayCircle フォールバック表示（Image 非描画）', () => {
    const { container } = render(<MediaCard {...baseProps} type="course" thumbnailUrl={null} />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0)
  })

  it('isFeatured=true でも UI 上に「注目」バッジは表示されない（props 互換のみ）', () => {
    render(<MediaCard {...baseProps} type="course" isFeatured={true} />)
    expect(screen.queryByText('注目')).not.toBeInTheDocument()
  })

  it('chapterCount/videoCount / duration / description を渡しても UI 上に表示されない（props 互換のみ）', () => {
    render(
      <MediaCard
        {...baseProps}
        type="course"
        chapterCount={3}
        videoCount={8}
        duration="12:34"
        description="この動画の説明"
      />,
    )
    expect(screen.queryByText(/章 \//)).not.toBeInTheDocument()
    expect(screen.queryByText('12:34')).not.toBeInTheDocument()
    expect(screen.queryByText('この動画の説明')).not.toBeInTheDocument()
  })
})
