import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * CourseDetailTemplate（Atomic Design / templates）
 *
 * 起点：
 * - docs/frontend/page-templates.md § 3. CourseDetailTemplate
 * - 対応画面：B004 /e-learning/courses/[slug]
 *
 * スロット式：
 *  - breadcrumb：パンくず（任意）
 *  - hero：コースヒーロー（タイトル・サムネ・概要・価格・CTA）
 *  - meta：メタ情報（章数・本数・合計時間・受講者数）
 *  - description：概要セクション（リッチテキスト）
 *  - curriculum：カリキュラム（章 → 動画 Accordion）
 *  - materials：資料ダウンロード（任意）
 *  - related：関連コース（任意）
 *
 * レイアウト：lg 未満は縦並び、lg 以上は左右 2 カラム（左：メイン / 右：sidebar slot）
 *  - sidebar：購入カード／視聴状況等を呼び出し側で渡す（任意）
 */

export interface CourseDetailTemplateProps {
  breadcrumb?: React.ReactNode
  hero: React.ReactNode
  meta?: React.ReactNode
  description?: React.ReactNode
  curriculum?: React.ReactNode
  materials?: React.ReactNode
  related?: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
}

const CourseDetailTemplate: React.FC<CourseDetailTemplateProps> = ({
  breadcrumb,
  hero,
  meta,
  description,
  curriculum,
  materials,
  related,
  sidebar,
  className,
}) => {
  return (
    <main
      className={cn(
        'mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 md:py-12',
        className,
      )}
    >
      {breadcrumb}
      {hero}

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          {meta}
          {description}
          {curriculum}
          {materials}
          {related}
        </div>
        {sidebar && (
          <aside className="w-full shrink-0 lg:w-80">{sidebar}</aside>
        )}
      </div>
    </main>
  )
}
CourseDetailTemplate.displayName = 'CourseDetailTemplate'

export { CourseDetailTemplate }
