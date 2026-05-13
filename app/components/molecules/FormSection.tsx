import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * FormSection molecule（Atomic Design / molecules）
 *
 * 起点：docs/frontend/component-candidates.md molecules § FormSection
 *
 * 構成：見出し（h3）+ 任意の説明文 + 子の FormField 群を縦に並べる。
 *
 * - title：必須（h3 として表示）
 * - description：任意（説明文）
 * - children：FormField 群（縦並び・space-y-4）
 *
 * 既存 globals.css のグローバル h3 ルール（font-weight: 500 = medium）を踏襲。
 */

export interface FormSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** セクション見出し。h3 として表示。 */
  title: string
  /** 補足説明。 */
  description?: string
  /** FormField 等の子要素。 */
  children: React.ReactNode
  /** 子要素の縦間隔。既定 space-y-4。 */
  spacing?: string
}

const FormSection = React.forwardRef<HTMLElement, FormSectionProps>(
  (
    { className, title, description, children, spacing = 'space-y-4', ...props },
    ref,
  ) => {
    return (
      <section ref={ref} className={cn('w-full', className)} {...props}>
        <header className="mb-4">
          <h3 className="text-lg text-foreground">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </header>
        <div className={spacing}>{children}</div>
      </section>
    )
  },
)
FormSection.displayName = 'FormSection'

export { FormSection }
