import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * InfoPageTemplate（Atomic Design / templates）
 *
 * 起点：
 * - docs/frontend/page-templates.md § 7. InfoPageTemplate
 * - 対応画面：B009 購入完了 / B010 購入キャンセル
 *
 * 中央カード：
 *  - icon：アイコン（任意）
 *  - title：見出し（h1・必須）
 *  - description：本文（任意）
 *  - primaryCta：主 CTA（任意）
 *  - secondaryCta：副 CTA（任意）
 *
 * シンプル設計：状態（成功 / キャンセル等）の視覚的差別化はアイコン / 色で呼び出し側が制御。
 */

export interface InfoPageTemplateProps {
  icon?: React.ReactNode
  title: string
  description?: React.ReactNode
  primaryCta?: React.ReactNode
  secondaryCta?: React.ReactNode
  className?: string
}

const InfoPageTemplate: React.FC<InfoPageTemplateProps> = ({
  icon,
  title,
  description,
  primaryCta,
  secondaryCta,
  className,
}) => {
  return (
    <main
      className={cn(
        'flex min-h-[60vh] w-full items-center justify-center bg-background px-6 py-12',
        className,
      )}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-lg border border-border bg-card p-8 text-center text-card-foreground">
        {icon && <div>{icon}</div>}
        <h1 className="text-2xl text-foreground">{title}</h1>
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
        {(primaryCta || secondaryCta) && (
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            {primaryCta}
            {secondaryCta}
          </div>
        )}
      </div>
    </main>
  )
}
InfoPageTemplate.displayName = 'InfoPageTemplate'

export { InfoPageTemplate }
