'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * Tag atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § Tag
 * - radius.md：ピル形バッジ（カテゴリ等）→ rounded-full
 *
 * variant：
 * - filled：塗りつぶし（既定）
 * - outlined：枠線のみ
 * - selectable：クリック可能 + selected/unselected 切替（フィルタ UI 等）
 *
 * selectable variant のときのみ button 要素として描画し、selected prop で active 表現。
 * それ以外は span 要素として描画（非インタラクティブ）。
 */

const tagVariants = cva(
  'inline-flex items-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        filled: 'bg-muted text-muted-foreground',
        outlined: 'border border-input bg-background text-foreground',
        selectable:
          'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
      },
      selected: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'selectable',
        selected: true,
        class: 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground',
      },
    ],
    defaultVariants: {
      variant: 'filled',
      size: 'md',
      selected: false,
    },
  },
)

export type TagVariant = NonNullable<VariantProps<typeof tagVariants>['variant']>
export type TagSize = NonNullable<VariantProps<typeof tagVariants>['size']>

type SelectableProps = {
  variant: 'selectable'
  selected?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

type StaticProps = {
  variant?: Exclude<TagVariant, 'selectable'>
  selected?: never
} & Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>

export type TagProps = (SelectableProps | StaticProps) & {
  size?: TagSize
  className?: string
  children: React.ReactNode
}

const Tag = React.forwardRef<HTMLElement, TagProps>((props, ref) => {
  const { className, size, children, ...rest } = props as TagProps & {
    [key: string]: unknown
  }

  if (props.variant === 'selectable') {
    const { selected = false, ...buttonProps } = rest as SelectableProps
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        aria-pressed={selected}
        className={cn(tagVariants({ variant: 'selectable', size, selected }), className)}
        {...buttonProps}
      >
        {children}
      </button>
    )
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cn(
        tagVariants({ variant: (props.variant ?? 'filled') as Exclude<TagVariant, 'selectable'>, size }),
        className,
      )}
      {...(rest as StaticProps)}
    >
      {children}
    </span>
  )
})
Tag.displayName = 'Tag'

export { Tag, tagVariants }
