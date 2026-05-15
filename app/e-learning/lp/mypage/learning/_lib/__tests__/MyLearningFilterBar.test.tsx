// @vitest-environment jsdom
import * as React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

const pushMock = vi.fn()
const searchParamsRef = { current: new URLSearchParams() }

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/e-learning/lp/mypage/learning',
  useSearchParams: () => searchParamsRef.current,
}))

// Radix Select は jsdom 環境で portal / hidden が絡みクリック検証が困難。
// onValueChange を直接呼び出して URL push 経路を検証する形にするため Select 自体は実 atom を使用しつつ、
// FilterBar が Select に正しく value / onValueChange / options を渡すことを確認する。
// → render 後に対象 Select の onValueChange を取り出すことが難しいので、
//   ここでは Select を簡易モックして props 経由で URL 変更を検証する。
vi.mock('@/app/components/molecules/Select', () => ({
  Select: ({ id, value, onValueChange, options }: {
    id?: string
    value?: string
    onValueChange?: (v: string) => void
    options: Array<{ label: string; value: string }>
  }) => (
    <select
      data-testid={id ?? 'select'}
      value={value}
      onChange={e => onValueChange?.((e.target as HTMLSelectElement).value)}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}))

import { MyLearningFilterBar } from '../MyLearningFilterBar'

beforeEach(() => {
  pushMock.mockReset()
  searchParamsRef.current = new URLSearchParams()
})

const categories = [
  { id: 'cat-1', name: 'AI 基礎' },
  { id: 'cat-2', name: 'LLM' },
]

describe('MyLearningFilterBar', () => {
  it('種別「コース」選択で URL に type=course が追加される', () => {
    render(<MyLearningFilterBar categories={categories} />)
    fireEvent.change(screen.getByTestId('mylearning-type'), { target: { value: 'course' } })
    expect(pushMock).toHaveBeenCalledWith(
      '/e-learning/lp/mypage/learning?type=course',
      { scroll: false },
    )
  })

  it('種別「すべて」選択で URL から type が削除される', () => {
    searchParamsRef.current = new URLSearchParams('type=course')
    render(<MyLearningFilterBar categories={categories} />)
    fireEvent.change(screen.getByTestId('mylearning-type'), { target: { value: 'all' } })
    expect(pushMock).toHaveBeenCalledWith('/e-learning/lp/mypage/learning', {
      scroll: false,
    })
  })

  it('カテゴリ選択で URL に category={id} が追加される', () => {
    render(<MyLearningFilterBar categories={categories} />)
    fireEvent.change(screen.getByTestId('mylearning-category'), { target: { value: 'cat-1' } })
    expect(pushMock).toHaveBeenCalledWith(
      '/e-learning/lp/mypage/learning?category=cat-1',
      { scroll: false },
    )
  })

  it('カテゴリ「すべて」選択で URL から category が削除される', () => {
    searchParamsRef.current = new URLSearchParams('category=cat-1')
    render(<MyLearningFilterBar categories={categories} />)
    fireEvent.change(screen.getByTestId('mylearning-category'), { target: { value: 'all' } })
    expect(pushMock).toHaveBeenCalledWith('/e-learning/lp/mypage/learning', {
      scroll: false,
    })
  })

  it('既存の他クエリ（tab）は維持される', () => {
    searchParamsRef.current = new URLSearchParams('tab=bookmarked')
    render(<MyLearningFilterBar categories={categories} />)
    fireEvent.change(screen.getByTestId('mylearning-type'), { target: { value: 'course' } })
    expect(pushMock).toHaveBeenCalledWith(
      '/e-learning/lp/mypage/learning?tab=bookmarked&type=course',
      { scroll: false },
    )
  })

  it('URL `type=course` で初期化されたとき select の value が course になる', () => {
    searchParamsRef.current = new URLSearchParams('type=course')
    render(<MyLearningFilterBar categories={categories} />)
    expect((screen.getByTestId('mylearning-type') as HTMLSelectElement).value).toBe('course')
  })

  it('categories が空配列でもエラーなく描画され、カテゴリは「カテゴリ」プレースホルダのみ表示', () => {
    render(<MyLearningFilterBar categories={[]} />)
    const select = screen.getByTestId('mylearning-category') as HTMLSelectElement
    expect(select.options).toHaveLength(1)
    expect(select.options[0].value).toBe('all')
    expect(select.options[0].text).toBe('カテゴリ')
  })

  it('Udemy 風プレースホルダ：未選択時は種別 options[0] のラベルが「種別」', () => {
    render(<MyLearningFilterBar categories={categories} />)
    const select = screen.getByTestId('mylearning-type') as HTMLSelectElement
    expect(select.options[0].text).toBe('種別')
    expect(select.options[0].value).toBe('all')
  })

  it('種別が未選択のとき ✕ ボタンと「フィルターをクリア」は表示されない', () => {
    render(<MyLearningFilterBar categories={categories} />)
    expect(screen.queryByLabelText('種別フィルタをクリア')).toBeNull()
    expect(screen.queryByLabelText('カテゴリフィルタをクリア')).toBeNull()
    expect(screen.queryByText('フィルターをクリア')).toBeNull()
  })

  it('種別選択時に ✕ ボタンが表示され、クリックで URL から type が削除される', () => {
    searchParamsRef.current = new URLSearchParams('type=course')
    render(<MyLearningFilterBar categories={categories} />)
    const clearBtn = screen.getByLabelText('種別フィルタをクリア')
    fireEvent.click(clearBtn)
    expect(pushMock).toHaveBeenCalledWith('/e-learning/lp/mypage/learning', {
      scroll: false,
    })
  })

  it('カテゴリ選択時に ✕ ボタンが表示され、クリックで URL から category が削除される', () => {
    searchParamsRef.current = new URLSearchParams('category=cat-1')
    render(<MyLearningFilterBar categories={categories} />)
    const clearBtn = screen.getByLabelText('カテゴリフィルタをクリア')
    fireEvent.click(clearBtn)
    expect(pushMock).toHaveBeenCalledWith('/e-learning/lp/mypage/learning', {
      scroll: false,
    })
  })

  it('「フィルターをクリア」ボタンは type/category いずれかが選択中のとき表示される', () => {
    searchParamsRef.current = new URLSearchParams('type=course')
    render(<MyLearningFilterBar categories={categories} />)
    expect(screen.getByText('フィルターをクリア')).toBeInTheDocument()
  })

  it('「フィルターをクリア」クリックで type と category の両方が URL から削除される（他クエリは維持）', () => {
    searchParamsRef.current = new URLSearchParams('tab=bookmarked&type=course&category=cat-1')
    render(<MyLearningFilterBar categories={categories} />)
    fireEvent.click(screen.getByText('フィルターをクリア'))
    expect(pushMock).toHaveBeenCalledWith(
      '/e-learning/lp/mypage/learning?tab=bookmarked',
      { scroll: false },
    )
  })

  it('未知の category id が URL にあるとき all 扱いになり ✕ ボタンは表示されない', () => {
    searchParamsRef.current = new URLSearchParams('category=unknown')
    render(<MyLearningFilterBar categories={categories} />)
    const select = screen.getByTestId('mylearning-category') as HTMLSelectElement
    expect(select.value).toBe('all')
    expect(screen.queryByLabelText('カテゴリフィルタをクリア')).toBeNull()
  })
})
