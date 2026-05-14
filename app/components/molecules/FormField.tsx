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
 * - children の入力フィールド（単一 React 要素）に aria-describedby / aria-errormessage を
 *   自動 wire-up（F-01・呼び出し側で指定済なら尊重して結合）
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
  /** 入力フィールド本体。 */
  children: React.ReactNode
}

type FieldElementProps = {
  'aria-describedby'?: string
  'aria-errormessage'?: string
  'aria-invalid'?: boolean | 'true' | 'false'
}

/**
 * 単一の React 要素である children に aria-* を自動付与。
 * 呼び出し側で既に指定済の値がある場合は半角スペース区切りで結合し、上書きしない。
 */
function wireFieldA11y(
  children: React.ReactNode,
  errorId: string | undefined,
  helpId: string | undefined,
): React.ReactNode {
  if (!React.isValidElement(children)) return children

  const existing = children.props as FieldElementProps
  const describedBy = [helpId, existing['aria-describedby']].filter(Boolean).join(' ') || undefined
  const errorMessageId = [errorId, existing['aria-errormessage']].filter(Boolean).join(' ') || undefined

  const next: FieldElementProps = {}
  if (describedBy !== existing['aria-describedby']) next['aria-describedby'] = describedBy
  if (errorMessageId !== existing['aria-errormessage']) next['aria-errormessage'] = errorMessageId
  // aria-invalid は呼び出し側に裁量を残す（自動付与しない）

  return Object.keys(next).length > 0
    ? React.cloneElement(children as React.ReactElement<FieldElementProps>, next)
    : children
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
      children,
      ...props
    },
    ref,
  ) => {
    const errorId = error ? `${htmlFor}-error` : undefined
    const helpId = helpText ? `${htmlFor}-help` : undefined
    const wiredChildren = wireFieldA11y(children, errorId, helpId)

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <Label htmlFor={htmlFor} required={required} className="mb-1.5 block">
          {label}
        </Label>
        {wiredChildren}
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
