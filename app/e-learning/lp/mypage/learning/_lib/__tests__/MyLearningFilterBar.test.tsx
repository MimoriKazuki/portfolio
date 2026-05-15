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
// 未選択時（value=undefined）は data-placeholder 属性で確認できる形でモック。
// options に "種別" / "カテゴリ" 自体が含まれないことを option 数で検証する。
vi.mock('@/app/components/molecules/Select', () => ({
  Select: ({ id, value, onValueChange, options, placeholder }: {
    id?: string
    value?: string
    onValueChange?: (v: string) => void
    options: Array<{ label: string; value: string }>
    placeholder?: string
  }) => (
    <select
      data-testid={id ?? 'select'}
      data-placeholder={placeholder ?? ''}
      // value=undefined だと React が uncontrolled になるため "" にフォールバック
      value={value ?? ''}
      onChange={e => onValueChange?.((e.target as HTMLSelectElement).value)}
    >
      {/* placeholder 用の空 option（jsdom 上で value="" を保持するために必須） */}
      {value === undefined && <option value="" disabled hidden>{placeholder ?? ''}</option>}
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

  // 旧「種別/カテゴリ『すべて』選択で URL 削除」は options から 'all' を除いたため廃止。
  // 同等の挙動は後続「✕ ボタン表示・クリックで URL から削除」テストで担保される。

  it('カテゴリ選択で URL に category={id} が追加される', () => {
    render(<MyLearningFilterBar categories={categories} />)
    fireEvent.change(screen.getByTestId('mylearning-category'), { target: { value: 'cat-1' } })
    expect(pushMock).toHaveBeenCalledWith(
      '/e-learning/lp/mypage/learning?category=cat-1',
      { scroll: false },
    )
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

  it('categories が空配列でも種別ドロップダウンは描画され、カテゴリ側 options は 0 件 + placeholder', () => {
    render(<MyLearningFilterBar categories={[]} />)
    const categorySelect = screen.getByTestId('mylearning-category') as HTMLSelectElement
    expect(categorySelect.dataset.placeholder).toBe('カテゴリ')
    // 業務 options は 0 件（placeholder 用の hidden option のみ存在 = 1 件）
    expect(categorySelect.options).toHaveLength(1)
    expect(categorySelect.options[0].hidden).toBe(true)
  })

  it('未選択時：種別 Select は placeholder="種別"、業務 options に「種別」「all」は含まれない', () => {
    render(<MyLearningFilterBar categories={categories} />)
    const select = screen.getByTestId('mylearning-type') as HTMLSelectElement
    expect(select.dataset.placeholder).toBe('種別')
    // 業務 options は course / content の 2 件のみ（+ placeholder の hidden 1 件で計 3 件）
    const visibleOptions = Array.from(select.options).filter(o => !o.hidden)
    expect(visibleOptions.map(o => o.value)).toEqual(['course', 'content'])
    expect(visibleOptions.map(o => o.text)).toEqual(['コース', '単体動画'])
  })

  it('未選択時：カテゴリ Select は placeholder="カテゴリ"、業務 options は categories のみ', () => {
    render(<MyLearningFilterBar categories={categories} />)
    const select = screen.getByTestId('mylearning-category') as HTMLSelectElement
    expect(select.dataset.placeholder).toBe('カテゴリ')
    const visibleOptions = Array.from(select.options).filter(o => !o.hidden)
    expect(visibleOptions.map(o => o.value)).toEqual(['cat-1', 'cat-2'])
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
    // value=undefined（モック上は空文字フォールバック）で placeholder 表示・✕ ボタン非表示
    expect(select.value).toBe('')
    expect(select.dataset.placeholder).toBe('カテゴリ')
    expect(screen.queryByLabelText('カテゴリフィルタをクリア')).toBeNull()
  })
})
