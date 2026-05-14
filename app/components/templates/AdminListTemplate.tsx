import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * AdminListTemplate（Atomic Design / templates）
 *
 * 起点：
 * - docs/frontend/page-templates.md § 8. AdminListTemplate
 * - 対応画面：C001 単体動画 / C004 カテゴリ / C005 コース / C009 購入履歴 / C010 ユーザー / C011 レガシー
 *
 * スロット式：
 *  - header：AdminPageHeader organism（タイトル + 新規作成ボタン等）
 *  - filterBar：AdminFilterBar organism（検索 + フィルタ・任意）
 *  - bulkActions：一括操作バー（任意・選択中のみ表示）
 *  - table：AdminDataTable organism（テーブル本体・ページング込み）
 */

export interface AdminListTemplateProps {
  header: React.ReactNode
  filterBar?: React.ReactNode
  bulkActions?: React.ReactNode
  table: React.ReactNode
  className?: string
}

const AdminListTemplate: React.FC<AdminListTemplateProps> = ({
  header,
  filterBar,
  bulkActions,
  table,
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
      {filterBar}
      {bulkActions && (
        <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
          {bulkActions}
        </div>
      )}
      {table}
    </main>
  )
}
AdminListTemplate.displayName = 'AdminListTemplate'

export { AdminListTemplate }
