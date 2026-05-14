import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * MyPageTemplate（Atomic Design / templates）
 *
 * 起点：
 * - docs/frontend/page-templates.md § 6. MyPageTemplate
 * - 対応画面：B011 購入履歴 / B012 ブックマーク / B013 視聴履歴 / B014 プロフィール
 *
 * スロット式：
 *  - header：ページタイトル（任意）
 *  - sidebar：マイページサブナビ（必須・MyPageSidebar organism を Phase 3 で実装）
 *  - children：選択中セクションの本体
 *
 * レイアウト：md 未満は縦並び（sidebar → main）、md 以上は左右 2 カラム
 */

export interface MyPageTemplateProps {
  header?: React.ReactNode
  sidebar: React.ReactNode
  children: React.ReactNode
  className?: string
}

const MyPageTemplate: React.FC<MyPageTemplateProps> = ({
  header,
  sidebar,
  children,
  className,
}) => {
  return (
    <main
      className={cn(
        'mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 md:py-12',
        className,
      )}
    >
      {header}
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <aside className="w-full shrink-0 md:w-64">{sidebar}</aside>
        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  )
}
MyPageTemplate.displayName = 'MyPageTemplate'

export { MyPageTemplate }
