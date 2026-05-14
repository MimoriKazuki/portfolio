import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * AuthTemplate（Atomic Design / templates）
 *
 * 起点：
 * - docs/frontend/page-templates.md § 5. AuthTemplate
 * - 対応画面：A001 /auth/login
 *
 * シンプル中央寄せ：
 *  - logo：ブランドロゴ（任意）
 *  - title：見出し（h1・必須）
 *  - description：補足（任意）
 *  - children：認証フォーム本体（Google ログインボタン等）
 *  - footer：利用規約／プライバシーポリシー導線（任意）
 */

export interface AuthTemplateProps {
  logo?: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

const AuthTemplate: React.FC<AuthTemplateProps> = ({
  logo,
  title,
  description,
  children,
  footer,
  className,
}) => {
  return (
    <main
      className={cn(
        'flex min-h-screen w-full items-center justify-center bg-background px-6 py-12',
        className,
      )}
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        {logo && <div>{logo}</div>}
        <header className="space-y-2">
          <h1 className="text-2xl text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </header>
        <div className="w-full">{children}</div>
        {footer && <div className="text-xs text-muted-foreground">{footer}</div>}
      </div>
    </main>
  )
}
AuthTemplate.displayName = 'AuthTemplate'

export { AuthTemplate }
