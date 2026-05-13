import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * Textarea atom（Atomic Design / atoms）
 *
 * 起点：
 * - docs/frontend/component-candidates.md atoms § Textarea
 * - docs/frontend/design-system/INDEX.md / ng-patterns.md §12 補足
 *
 * 既存 `app/components/ui/` に textarea.tsx は不在のため新規作成。
 *
 * resize 制御：
 * - vertical（既定・縦のみ）
 * - none（リサイズ不可）
 * - both（縦横両方）
 *
 * aria-invalid="true" のときエラースタイル。
 */

const textareaVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive',
  {
    variants: {
      resize: {
        vertical: 'resize-y',
        none: 'resize-none',
        both: 'resize',
      },
      size: {
        // Tailwind 既定 spacing スケールに 15(60px) / 30(120px) は存在しないため、
        // sm/lg は 4px 倍数の arbitrary value を許容（ng-patterns §3 は「非 4px 倍数」を NG とする）。
        // md は既定スケール h-20=80px に置換し arbitrary value を回避（design-mate 軽微指摘対応）。
        sm: 'min-h-[60px]',
        md: 'min-h-20',
        lg: 'min-h-[120px]',
      },
    },
    defaultVariants: {
      resize: 'vertical',
      size: 'md',
    },
  },
)

export type TextareaSize = NonNullable<VariantProps<typeof textareaVariants>['size']>
export type TextareaResize = NonNullable<VariantProps<typeof textareaVariants>['resize']>

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, resize, size, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(textareaVariants({ resize, size }), className)}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }
