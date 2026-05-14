import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * ErrorTemplate（Atomic Design / templates）
 *
 * 起点：
 * - docs/frontend/page-templates.md § 10. ErrorTemplate
 * - 対応画面：D001 (404) / D002 (5xx)
 *
 * 中央配置のメッセージ：
 *  - statusCode：404 / 500 等（任意・大型タイポで表示）
 *  - title：見出し（h1・必須）
 *  - description：説明（任意）
 *  - actions：ホーム導線等の CTA（任意）
 *
 * 既存 `not-found.tsx` を破壊しない（既存ファイル touch なし）。
 * 本 template は Phase 3 の error.tsx / not-found.tsx 整備時に利用する想定。
 */

export interface ErrorTemplateProps {
  /** ステータスコード（404 / 500 等）。 */
  statusCode?: string | number
  /** 見出し（必須）。 */
  title: string
  /** 補足説明。 */
  description?: React.ReactNode
  /** ホーム導線等の CTA（複数渡し可・呼び出し側で gap 整列）。 */
  actions?: React.ReactNode
  className?: string
}

const ErrorTemplate: React.FC<ErrorTemplateProps> = ({
  statusCode,
  title,
  description,
  actions,
  className,
}) => {
  return (
    <main
      role="alert"
      className={cn(
        'flex min-h-[60vh] w-full items-center justify-center bg-background px-6 py-12',
        className,
      )}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
        {statusCode !== undefined && (
          <p
            aria-hidden="true"
            className="text-5xl text-muted-foreground md:text-6xl"
          >
            {statusCode}
          </p>
        )}
        <h1 className="text-2xl text-foreground">{title}</h1>
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
        {actions && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </main>
  )
}
ErrorTemplate.displayName = 'ErrorTemplate'

export { ErrorTemplate }
