'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * Select molecule（Atomic Design / molecules）
 *
 * 起点：
 * - docs/frontend/component-candidates.md molecules § Select
 * - shadcn select ベース（@radix-ui/react-select）
 * - 既存 `app/components/ui/CustomSelect.tsx` は touch しない（新規ページ専用）
 *
 * 利用例：
 * ```
 * <Select value={v} onValueChange={setV} options={[
 *   { label: 'すべて', value: 'all' },
 *   { label: '無料', value: 'free' },
 * ]} placeholder="選択してください" />
 * ```
 *
 * size: sm / md / lg（Input/Trigger の高さに準拠）
 */

const selectTriggerVariants = cva(
  'flex w-full items-center justify-between rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive',
  {
    variants: {
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-3 py-2 text-sm',
        lg: 'h-11 px-4 py-2 text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type SelectSize = NonNullable<VariantProps<typeof selectTriggerVariants>['size']>

export type SelectOption = {
  label: string
  value: string
  disabled?: boolean
}

export interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  size?: SelectSize
  disabled?: boolean
  className?: string
  /** Trigger に aria-label を付与（label が別 atom にある場合）。 */
  'aria-label'?: string
  /** Trigger に aria-invalid を付与。 */
  'aria-invalid'?: boolean
  /** Trigger 要素の id（Label の htmlFor と紐付け）。 */
  id?: string
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      options,
      placeholder,
      size = 'md',
      disabled,
      className,
      id,
      'aria-label': ariaLabel,
      'aria-invalid': ariaInvalid,
    },
    ref,
  ) => {
    return (
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          ref={ref}
          id={id}
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
          className={cn(selectTriggerVariants({ size }), className)}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown aria-hidden="true" className="h-4 w-4 opacity-50 shrink-0" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className={cn(
              'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            )}
          >
            <SelectPrimitive.Viewport className="p-1 max-h-72 overflow-y-auto">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={cn(
                    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check aria-hidden="true" className="h-4 w-4" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    )
  },
)
Select.displayName = 'Select'

export { Select, selectTriggerVariants }
