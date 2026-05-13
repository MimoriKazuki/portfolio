'use client'

import * as React from 'react'
import { Label } from '@/app/components/atoms/Label'
import { cn } from '@/app/lib/utils'

/**
 * FormField molecule（Atomic Design / molecules）
 *
 * 起点：
 * - docs/frontend/component-candidates.md molecules § FormField
 * - 構成：Label（atoms）+ 入力フィールド（children slot）+ ErrorText（内包）
 *
 * 利用例：
 * ```
 * <FormField label="メール" htmlFor="email" required error={errors.email?.message} helpText="例：name@example.com">
 *   <Input id="email" type="email" aria-invalid={!!errors.email} />
 * </FormField>
 * ```
 *
 * アクセシビリティ：
 * - children の入力フィールドに id と aria-describedby を呼び出し側で連携させる
 * - error は赤系（text-destructive）/ helpText は muted-foreground
 */

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Label に表示するテキスト。 */
  label: string
  /** Label の htmlFor 属性（必須）。入力フィールドの id と一致させる。 */
  htmlFor: string
  /** 必須項目フラグ（Label のアスタリスク + 視覚補助）。 */
  required?: boolean
  /** エラーメッセージ。存在時に表示。 */
  error?: string
  /** ヘルプテキスト（補助説明）。 */
  helpText?: string
  /** Label と入力フィールドの間隔調整用。既定 mb-1.5。 */
  labelGap?: string
  /** 入力フィールド本体。 */
  children: React.ReactNode
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      className,
      label,
      htmlFor,
      required = false,
      error,
      helpText,
      labelGap = 'mb-1.5',
      children,
      ...props
    },
    ref,
  ) => {
    const errorId = error ? `${htmlFor}-error` : undefined
    const helpId = helpText ? `${htmlFor}-help` : undefined

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <Label htmlFor={htmlFor} required={required} className={labelGap + ' block'}>
          {label}
        </Label>
        {children}
        {helpText && !error && (
          <p id={helpId} className="mt-1 text-xs text-muted-foreground">
            {helpText}
          </p>
        )}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-1 text-xs text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    )
  },
)
FormField.displayName = 'FormField'

export { FormField }
