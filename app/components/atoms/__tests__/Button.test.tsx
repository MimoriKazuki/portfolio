/**
 * @vitest-environment jsdom
 */
/**
 * Button atom のユニットテスト（Phase 2 Sub 8a サンプル実装）
 *
 * 起点：
 * - docs/wbs/phase2.md P2-UT-01「atoms のユニットテスト」
 *
 * 位置付け：
 * - Phase 3 で各 atoms / molecules を実画面に組み込む際の
 *   コンポーネントテスト雛形（参考実装）
 * - vitest + @testing-library/react + jsdom 環境
 *   （vitest.config.ts `environmentMatchGlobs` で **\/__tests__/**\/*.tsx → jsdom）
 *
 * カバー観点：
 * - レンダリング（children / variant / size の class 反映）
 * - フォワード ref
 * - asChild パターン（Radix Slot 経由で Link 等にスタイル適用）
 * - loading prop の disabled / aria-busy 連動
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import { Button } from '../Button'

describe('Button atom — レンダリング', () => {
  it('children を表示する', () => {
    render(<Button>クリック</Button>)
    expect(screen.getByRole('button', { name: 'クリック' })).toBeInTheDocument()
  })

  it('variant="primary"（既定）で primary class が付与される', () => {
    render(<Button>primary</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toMatch(/bg-primary/)
  })

  it('variant="outline" で outline class が付与される', () => {
    render(<Button variant="outline">outline</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toMatch(/border-input/)
  })

  it('size="sm" / "md" / "lg" で高さが切り替わる', () => {
    const { rerender } = render(<Button size="sm">sm</Button>)
    expect(screen.getByRole('button').className).toMatch(/h-9/)
    rerender(<Button size="md">md</Button>)
    expect(screen.getByRole('button').className).toMatch(/h-10/)
    rerender(<Button size="lg">lg</Button>)
    expect(screen.getByRole('button').className).toMatch(/h-11/)
  })

  it('追加 className が cn でマージされる', () => {
    render(<Button className="my-extra">extra</Button>)
    expect(screen.getByRole('button').className).toContain('my-extra')
  })
})

describe('Button atom — クリック挙動', () => {
  it('onClick が発火する', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>click</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled の場合 onClick が発火しない', async () => {
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        disabled
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})

describe('Button atom — loading prop', () => {
  it('loading=true で disabled + aria-busy が付与される', () => {
    render(<Button loading>loading</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-busy', 'true')
  })

  it('loading=false（既定）では aria-busy 属性がない', () => {
    render(<Button>normal</Button>)
    const btn = screen.getByRole('button')
    expect(btn).not.toHaveAttribute('aria-busy')
  })
})

describe('Button atom — asChild パターン', () => {
  it('asChild=true で <a> として描画され、button class が継承される', () => {
    render(
      <Button asChild variant="primary">
        <a href="/test">link</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'link' })
    expect(link).toHaveAttribute('href', '/test')
    // Radix Slot により button の class が a タグに適用される
    expect(link.className).toMatch(/bg-primary/)
  })
})

describe('Button atom — forwardRef', () => {
  it('ref が button 要素に渡される', () => {
    const ref = vi.fn()
    render(<Button ref={ref}>with ref</Button>)
    expect(ref).toHaveBeenCalled()
    // 渡された ref の引数が HTMLButtonElement かつ tagName=BUTTON
    const refArg = ref.mock.calls[0]?.[0] as HTMLButtonElement | null
    expect(refArg?.tagName).toBe('BUTTON')
  })
})
