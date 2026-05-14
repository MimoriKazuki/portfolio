import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * VideoPlayerTemplate（Atomic Design / templates）
 *
 * 起点：
 * - docs/frontend/page-templates.md § 4. VideoPlayerTemplate
 * - 対応画面：B005 コース内動画 / B007 単体動画
 *
 * スロット式（Udemy 風 2 カラム）：
 *  - breadcrumb：パンくず + 戻るリンク（任意）
 *  - topbar：「次のレッスン」ボタン等（任意）
 *  - sidebar：レッスンリスト（コース内） or 関連動画リスト（単体動画）
 *  - player：動画プレーヤー（VideoPlayer organism・Phase 3）
 *  - tabs：「概要」「資料」「関連コンテンツ」（VideoTabs organism・Phase 3）
 *
 * レスポンシブ：xl 未満は縦並び（player → sidebar の順）、xl 以上で 2 カラム（左：sidebar / 右：player + tabs）
 *  - スマホでは sidebar はボトムシート化される想定だが、本 template はレイアウトのみ提供
 *    し、ボトムシート化は呼び出し側 / sidebar 内で実装する
 */

export interface VideoPlayerTemplateProps {
  breadcrumb?: React.ReactNode
  topbar?: React.ReactNode
  sidebar: React.ReactNode
  player: React.ReactNode
  tabs?: React.ReactNode
  className?: string
}

const VideoPlayerTemplate: React.FC<VideoPlayerTemplateProps> = ({
  breadcrumb,
  topbar,
  sidebar,
  player,
  tabs,
  className,
}) => {
  return (
    <main
      className={cn(
        'mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6 md:py-8',
        className,
      )}
    >
      {(breadcrumb || topbar) && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {breadcrumb}
          {topbar}
        </div>
      )}

      <div className="flex flex-col gap-6 xl:flex-row xl:gap-8">
        <aside className="w-full shrink-0 xl:w-80">{sidebar}</aside>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {player}
          {tabs}
        </div>
      </div>
    </main>
  )
}
VideoPlayerTemplate.displayName = 'VideoPlayerTemplate'

export { VideoPlayerTemplate }
