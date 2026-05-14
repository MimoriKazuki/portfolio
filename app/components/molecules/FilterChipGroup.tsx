'use client'

import * as React from 'react'
import { Tag } from '@/app/components/atoms/Tag'
import { cn } from '@/app/lib/utils'

/**
 * FilterChipGroup molecule（Atomic Design / molecules）
 *
 * 起点：
 * - docs/frontend/component-candidates.md molecules § FilterChipGroup
 * - 構成：Tag (selectable) × N
 *
 * 利用例：
 * ```
 * <FilterChipGroup
 *   options={[
 *     { label: 'すべて', value: 'all' },
 *     { label: 'AI', value: 'ai' },
 *     { label: 'マネジメント', value: 'mgmt' },
 *   ]}
 *   selected={['ai']}
 *   onChange={setSelected}
 *   multiple
 *   resetValue="all"
 * />
 * ```
 *
 * - multiple=true（既定）：複数選択。クリックでトグル
 * - multiple=false：単一選択（クリックで切替・空にはならない設計）
 * - resetValue を指定すると、その option がクリックされた際は selected を `[]` に戻す（"すべて" ボタン）
 *   - multiple=false の場合は resetValue で `[resetValue]` を選択状態にする
 *   - resetValue の chip は selected=[] / selected.includes(resetValue) のいずれでも active 表示にする
 * - role="group" + aria-label でフィルタ目的を支援技術へ通知
 */

export type FilterChipOption = {
  label: string
  value: string
  disabled?: boolean
}

export interface FilterChipGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: FilterChipOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  /** 複数選択（既定 true）。 */
  multiple?: boolean
  /** 「すべて」リセット用の value。指定時は当該 chip クリックで selected=[] に戻す。 */
  resetValue?: string
  /** Tag の size。既定 md。 */
  size?: 'sm' | 'md'
}

const FilterChipGroup = React.forwardRef<HTMLDivElement, FilterChipGroupProps>(
  (
    {
      options,
      selected,
      onChange,
      multiple = true,
      resetValue,
      size = 'md',
      className,
      'aria-label': ariaLabel = 'フィルタ',
      ...props
    },
    ref,
  ) => {
    const isResetActive = resetValue !== undefined && (
      selected.length === 0 || selected.includes(resetValue)
    )

    const handleClick = (value: string) => {
      if (resetValue !== undefined && value === resetValue) {
        if (multiple) {
          onChange([])
        } else {
          onChange([resetValue])
        }
        return
      }

      if (multiple) {
        const next = selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected.filter((v) => v !== resetValue), value]
        onChange(next)
      } else {
        onChange([value])
      }
    }

    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        className={cn('flex flex-wrap items-center gap-2', className)}
        {...props}
      >
        {options.map((opt) => {
          const isSelected =
            resetValue !== undefined && opt.value === resetValue
              ? isResetActive
              : selected.includes(opt.value)
          return (
            <Tag
              key={opt.value}
              variant="selectable"
              size={size}
              selected={isSelected}
              disabled={opt.disabled}
              onClick={() => handleClick(opt.value)}
            >
              {opt.label}
            </Tag>
          )
        })}
      </div>
    )
  },
)
FilterChipGroup.displayName = 'FilterChipGroup'

export { FilterChipGroup }
