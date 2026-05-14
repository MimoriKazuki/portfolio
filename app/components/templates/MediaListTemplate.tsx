import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * MediaListTemplate（Atomic Design / templates）
 *
 * 起点：
 * - docs/frontend/page-templates.md § 2. MediaListTemplate
 * - 対応画面：B002 会員ホーム / B003 コース一覧 / B006 単体動画一覧
 *
 * スロット式：
 *  - header：ページヘッダー（タイトル・サブタイトル）
 *  - filterBar：MediaFilterBar
 *  - grid：MediaGrid（カード群 or 空状態 / ローディング）
 *  - pagination：Pagination
 */

export interface MediaListTemplateProps {
  header: React.ReactNode
  filterBar?: React.ReactNode
  grid: React.ReactNode
  pagination?: React.ReactNode
  className?: string
}

const MediaListTemplate: React.FC<MediaListTemplateProps> = ({
  header,
  filterBar,
  grid,
  pagination,
  className,
}) => {
  return (
    <main
      className={cn(
        'mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 md:py-12',
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        {header}
        {filterBar}
      </div>
      {grid}
      {pagination && <div className="mt-4">{pagination}</div>}
    </main>
  )
}
MediaListTemplate.displayName = 'MediaListTemplate'

export { MediaListTemplate }
