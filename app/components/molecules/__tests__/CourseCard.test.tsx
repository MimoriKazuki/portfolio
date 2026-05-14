/**
 * @vitest-environment jsdom
 */
/**
 * CourseCard molecule のユニットテスト（Phase 3 緊急修正 unittest-mate 指示）
 *
 * 観点：
 * - thumbnailUrl の有無で Image / PlayCircle フォールバックを正しく切替
 * - isFeatured バッジの表示制御
 * - chapterCount + videoCount のメタ表示分岐（両方指定時のみ）
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// next/link：単純な <a href={href}> として描画
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode } & Record<string, unknown>) => (
    <a href={typeof href === 'string' ? href : String(href)} {...props}>
      {children}
    </a>
  ),
}))

// next/image：alt 属性を持つ <img> として描画
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

// cn ユーティリティ：classnames を半角スペースで結合
vi.mock('@/app/lib/utils', () => ({
  cn: (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' '),
}))

import { CourseCard } from '../CourseCard'

const baseProps = {
  href: '/e-learning/lp/courses/dummy-ai-intro-free',
  title: 'AI 入門コース（無料体験版）',
  thumbnailUrl: null as string | null,
  categoryName: 'AI 基礎',
  isFree: true,
  price: null as number | null,
}

describe('CourseCard molecule', () => {
  it('thumbnailUrl あり → Image が描画され PlayCircle フォールバックは表示されない', () => {
    const { container } = render(
      <CourseCard {...baseProps} thumbnailUrl="https://example.com/thumb.png" />,
    )
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toBe('https://example.com/thumb.png')
    // PlayCircle（lucide-react）は svg として描画される。fallback がないことを SVG 数で確認
    // → Image 表示時はサムネ枠内に svg なし（注目バッジ非表示時）
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBe(0)
  })

  it('thumbnailUrl null → PlayCircle フォールバック表示（Image は描画されない）', () => {
    const { container } = render(<CourseCard {...baseProps} thumbnailUrl={null} />)
    expect(container.querySelector('img')).toBeNull()
    // PlayCircle が svg として描画される
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('isFeatured=true → 「注目」バッジを表示、isFeatured=false（既定）→ 表示しない', () => {
    const { rerender } = render(<CourseCard {...baseProps} isFeatured={true} />)
    expect(screen.getByText('注目')).toBeInTheDocument()

    rerender(<CourseCard {...baseProps} isFeatured={false} />)
    expect(screen.queryByText('注目')).not.toBeInTheDocument()
  })

  it('chapterCount + videoCount 両方指定 → メタ表示、片方 undefined → メタ非表示', () => {
    const { rerender } = render(
      <CourseCard {...baseProps} chapterCount={3} videoCount={8} />,
    )
    expect(screen.getByText('3 章 / 8 動画')).toBeInTheDocument()

    rerender(<CourseCard {...baseProps} chapterCount={3} videoCount={undefined} />)
    expect(screen.queryByText(/章 \/ /)).not.toBeInTheDocument()

    rerender(<CourseCard {...baseProps} chapterCount={undefined} videoCount={8} />)
    expect(screen.queryByText(/章 \/ /)).not.toBeInTheDocument()
  })
})
