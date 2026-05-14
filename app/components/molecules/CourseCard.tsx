import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle } from 'lucide-react'
import { Badge } from '@/app/components/atoms/Badge'
import { PriceTag } from '@/app/components/molecules/PriceTag'
import { cn } from '@/app/lib/utils'

/**
 * CourseCard molecule（Atomic Design / molecules）
 *
 * 起点：
 * - team-lead 指示「Udemy / Claude Code Academy 風のコース一覧カード」
 * - docs/frontend/component-candidates.md molecules § CourseCard（新規追加候補）
 *
 * 構成：
 * - 上部：aspect-video のサムネ（thumbnail_url 必須・null フォールバックは bg-muted + アイコン）
 * - タイトル（2 行クランプ）
 * - カテゴリ表示（任意）
 * - メタ：章数・動画数（バッジ形式・Tag atom 流用しないインライン）
 * - 注目バッジ（is_featured）
 * - 価格 / 無料バッジ（PriceTag molecule 流用）
 *
 * 非破壊原則：
 * - 既存 ui/ / 既存 LP / 既存 admin の表示には影響しない
 * - B002 コース一覧の CourseListCard 置き換え用途
 */

export interface CourseCardProps {
  /** リンク先（B004 への URL）。 */
  href: string
  /** コースタイトル。 */
  title: string
  /** サムネイル URL。null の場合はプレースホルダ表示。 */
  thumbnailUrl: string | null
  /** カテゴリ名（任意）。 */
  categoryName?: string | null
  /** 章数（未指定時はメタ非表示）。 */
  chapterCount?: number
  /** 動画本数（未指定時はメタ非表示）。 */
  videoCount?: number
  /** 無料コースか。 */
  isFree: boolean
  /** 価格（円・有料時）。 */
  price: number | null
  /** 注目コース表示。 */
  isFeatured?: boolean
  /** 外側コンテナの追加 className。 */
  className?: string
}

const CourseCard = React.forwardRef<HTMLAnchorElement, CourseCardProps>(
  (
    {
      href,
      title,
      thumbnailUrl,
      categoryName,
      chapterCount,
      videoCount,
      isFree,
      price,
      isFeatured = false,
      className,
    },
    ref,
  ) => {
    return (
      <Link
        ref={ref}
        href={href}
        aria-label={`${title} の詳細を見る`}
        className={cn(
          'group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground transition hover:border-primary',
          className,
        )}
      >
        {/* サムネ：aspect-video + フォールバック */}
        <div className="relative aspect-video w-full bg-muted">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition group-hover:opacity-90"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <PlayCircle aria-hidden="true" className="h-12 w-12" />
            </div>
          )}
          {isFeatured && (
            <div className="absolute left-3 top-3">
              <Badge variant="info">注目</Badge>
            </div>
          )}
        </div>

        {/* 本体 */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          {/* 上段：種別 + カテゴリ */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="info">コース</Badge>
            {categoryName && <span>{categoryName}</span>}
          </div>

          {/* タイトル（2 行クランプ） */}
          <h3 className="line-clamp-2 text-base text-foreground group-hover:text-primary md:text-lg">
            {title}
          </h3>

          {/* メタ：章数・動画数（両方指定された時のみ表示） */}
          {chapterCount !== undefined && videoCount !== undefined && (
            <p className="text-xs text-muted-foreground">
              {chapterCount} 章 / {videoCount} 動画
            </p>
          )}

          {/* 下段：価格 / 無料バッジ */}
          <div className="mt-auto">
            <PriceTag
              free={isFree}
              amount={!isFree && price !== null ? price : undefined}
            />
          </div>
        </div>
      </Link>
    )
  },
)
CourseCard.displayName = 'CourseCard'

export { CourseCard }
