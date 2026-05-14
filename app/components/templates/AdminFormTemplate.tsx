import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * AdminFormTemplate（Atomic Design / templates）
 *
 * 起点：
 * - docs/frontend/page-templates.md § 9. AdminFormTemplate
 * - 対応画面：C002/C003 単体動画 新規/編集、C006/C007 コース 新規/編集（C008 はそのタブとして内包）
 *
 * スロット式（管理：詳細／編集の汎用テンプレ）：
 *  - header：ページヘッダー（タイトル + 保存 / 論理削除 / 公開ボタン）
 *  - tabs：タブナビ（任意・コース時は「基本情報」「カリキュラム」「資料」、単体動画時は「基本情報」「資料」）
 *  - children：選択中タブの本体（FormSection の縦積み）
 *  - sidebar：サイドカード（状態・公開フラグ・最終更新・Stripe Price 等／任意）
 *
 * レイアウト：lg 未満は縦並び、lg 以上は左右 2 カラム
 *  - sidebar 省略時は children のみ全幅
 */

export interface AdminFormTemplateProps {
  header: React.ReactNode
  tabs?: React.ReactNode
  children: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
}

const AdminFormTemplate: React.FC<AdminFormTemplateProps> = ({
  header,
  tabs,
  children,
  sidebar,
  className,
}) => {
  return (
    <main
      className={cn(
        'mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 md:py-10',
        className,
      )}
    >
      {header}
      {tabs}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
        {sidebar && (
          <aside className="w-full shrink-0 lg:w-72">{sidebar}</aside>
        )}
      </div>
    </main>
  )
}
AdminFormTemplate.displayName = 'AdminFormTemplate'

export { AdminFormTemplate }
