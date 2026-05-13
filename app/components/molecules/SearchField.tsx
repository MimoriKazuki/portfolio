'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { Input, type InputSize } from '@/app/components/atoms/Input'
import { cn } from '@/app/lib/utils'

/**
 * SearchField molecule（Atomic Design / molecules）
 *
 * 起点：docs/frontend/component-candidates.md molecules § SearchField
 *
 * 構成：Input（atoms）+ 左 Search アイコン + 右 clear ボタン（値があるとき表示）
 *
 * - controlled：value と onChange を必ず指定（onChange は文字列値を受ける高レベル API）
 * - onClear が無い場合は内部で onChange('') を呼ぶ
 * - size: sm / md / lg（Input atom の size に追従）
 */

export interface SearchFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'size' | 'type' | 'value' | 'onChange'
  > {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  size?: InputSize
  placeholder?: string
}

const sizeIconClass = {
  sm: 'h-4 w-4',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const

const sizePadding = {
  sm: { left: 'pl-9', right: 'pr-9' },
  md: { left: 'pl-9', right: 'pr-9' },
  lg: { left: 'pl-10', right: 'pr-10' },
} as const

const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      className,
      value,
      onChange,
      onClear,
      size = 'md',
      placeholder = '検索...',
      ...rest
    },
    ref,
  ) => {
    const iconClass = sizeIconClass[size]
    const padding = sizePadding[size]
    const hasValue = value.length > 0

    const handleClear = () => {
      if (onClear) onClear()
      else onChange('')
    }

    return (
      <div className={cn('relative w-full', className)}>
        <Search
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
            iconClass,
          )}
        />
        <Input
          ref={ref}
          type="search"
          size={size}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(padding.left, hasValue && padding.right)}
          {...rest}
        />
        {hasValue && (
          <button
            type="button"
            aria-label="検索クリア"
            onClick={handleClear}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <X aria-hidden="true" className={iconClass} />
          </button>
        )}
      </div>
    )
  },
)
SearchField.displayName = 'SearchField'

export { SearchField }
