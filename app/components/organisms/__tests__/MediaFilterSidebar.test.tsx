/**
 * @vitest-environment jsdom
 */
/**
 * MediaFilterSidebar organism のユニットテスト（unittest-mate 指示）
 *
 * 観点：
 * - Checkbox の onCheckedChange が onTypesChange に正しく接続される
 * - RadioGroup の onValueChange が onPriceChange に正しく接続される
 * - categories 空配列時にカテゴリセクションが描画されない
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

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

vi.mock('@/app/components/atoms/Radio', () => ({
  RadioGroup: ({
    value,
    onValueChange,
    children,
  }: {
    value: string
    onValueChange: (v: string) => void
    children: React.ReactNode
  }) => (
    <div data-testid="radio-group" data-value={value}>
      {/* テスト用：onValueChange を直接呼べるよう div でラップ */}
      <button
        type="button"
        data-testid="radio-trigger-free"
        onClick={() => onValueChange('free')}
      />
      <button
        type="button"
        data-testid="radio-trigger-paid"
        onClick={() => onValueChange('paid')}
      />
      {children}
    </div>
  ),
  RadioGroupItem: ({ id, value }: { id: string; value: string }) => (
    <input type="radio" id={id} value={value} data-testid={id} readOnly />
  ),
}))

vi.mock('@/app/components/atoms/Label', () => ({
  Label: ({
    children,
    htmlFor,
    className,
  }: {
    children: React.ReactNode
    htmlFor: string
    className?: string
  }) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}))

vi.mock('@/app/lib/utils', () => ({
  cn: (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' '),
}))

import { MediaFilterSidebar } from '../MediaFilterSidebar'

const baseProps = {
  selectedTypes: [] as ('course' | 'content')[],
  onTypesChange: vi.fn(),
  selectedCategoryIds: [] as string[],
  onCategoriesChange: vi.fn(),
  categories: [{ id: 'cat-1', name: 'AI 基礎' }],
  priceFilter: 'all' as const,
  onPriceChange: vi.fn(),
}

describe('MediaFilterSidebar organism', () => {
  it('「コース」チェックボックスを変更すると onTypesChange が呼ばれる', () => {
    const onTypesChange = vi.fn()
    render(<MediaFilterSidebar {...baseProps} onTypesChange={onTypesChange} />)
    fireEvent.click(screen.getByTestId('filter-type-course'))
    expect(onTypesChange).toHaveBeenCalledTimes(1)
    expect(onTypesChange).toHaveBeenCalledWith(['course'])
  })

  it('価格ラジオを変更すると onPriceChange が呼ばれる', () => {
    const onPriceChange = vi.fn()
    render(<MediaFilterSidebar {...baseProps} onPriceChange={onPriceChange} />)
    fireEvent.click(screen.getByTestId('radio-trigger-free'))
    expect(onPriceChange).toHaveBeenCalledWith('free')
  })

  it('categories 空配列 → カテゴリセクション非表示', () => {
    render(<MediaFilterSidebar {...baseProps} categories={[]} />)
    expect(screen.queryByText('カテゴリ')).not.toBeInTheDocument()
  })
})
