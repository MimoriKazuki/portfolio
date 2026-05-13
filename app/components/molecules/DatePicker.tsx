'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * DatePicker molecule（Atomic Design / molecules）
 *
 * 起点：docs/frontend/component-candidates.md molecules § DatePicker
 *
 * 構成：日付表示 button（Input ライクなトリガー）+ Popover + react-day-picker Calendar
 *
 * - controlled API：value (Date | null) / onChange (Date | null)
 * - 表示は `yyyy/MM/dd` 形式（日本ロケール）
 * - size: sm / md / lg（Input atom と整合）
 */

const triggerVariants = cva(
  'flex w-full items-center justify-start gap-2 rounded-md border border-input bg-background text-left font-normal ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive',
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

export type DatePickerSize = NonNullable<VariantProps<typeof triggerVariants>['size']>

export interface DatePickerProps {
  value?: Date | null
  onChange?: (value: Date | null) => void
  placeholder?: string
  size?: DatePickerSize
  disabled?: boolean
  className?: string
  id?: string
  'aria-label'?: string
  'aria-invalid'?: boolean
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = '日付を選択',
      size = 'md',
      disabled,
      className,
      id,
      'aria-label': ariaLabel,
      'aria-invalid': ariaInvalid,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false)
    const display = value ? format(value, 'yyyy/MM/dd', { locale: ja }) : ''

    const handleSelect = (date: Date | undefined) => {
      onChange?.(date ?? null)
      if (date) setOpen(false)
    }

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            id={id}
            type="button"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-invalid={ariaInvalid}
            className={cn(triggerVariants({ size }), className)}
          >
            <CalendarIcon aria-hidden="true" className="h-4 w-4 shrink-0 opacity-60" />
            <span className={cn('flex-1 truncate', !display && 'text-muted-foreground')}>
              {display || placeholder}
            </span>
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className={cn(
              'z-50 w-auto rounded-md border bg-popover p-3 text-popover-foreground shadow-md outline-none',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            )}
          >
            <DayPicker
              mode="single"
              locale={ja}
              selected={value ?? undefined}
              onSelect={handleSelect}
              showOutsideDays
            />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )
  },
)
DatePicker.displayName = 'DatePicker'

export { DatePicker, triggerVariants as datePickerTriggerVariants }
