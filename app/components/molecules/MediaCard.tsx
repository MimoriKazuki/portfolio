import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle, Clock } from 'lucide-react'
import { Badge } from '@/app/components/atoms/Badge'
import { Tag } from '@/app/components/atoms/Tag'
import { PriceTag } from '@/app/components/molecules/PriceTag'
import { cn } from '@/app/lib/utils'

/**
 * MediaCard molecule（Atomic Design / molecules）
 *
 * 起点：
 * - team-lead 指示「B002 統合一覧（コース + 単体動画混在）」
 * - CourseCard を拡張し、コース / 単体動画 両対応にしたカード
 *
 * 構成：
 * - 上部：aspect-video サムネ + フォールバック（bg-muted + PlayCircle）
 * - 左上 overlay：種別バッジ（type='course' → 「コース」、'content' → 「動画」）
 * - 右上 overlay：注目バッジ（isFeatured 時のみ）
 * - タイトル：line-clamp-2
 * - 説明：line-clamp-2（任意）
 * - メタ：
 *   - course：N 章 / M 動画
 *   - content：duration（Clock icon + Tag）
 * - 価格 / 無料：PriceTag molecule
 *
 * 非破壊：既存 CourseCard / ui/ / LP / admin に影響なし。
 */

export type MediaType = 'course' | 'content'

export interface MediaCardProps {
  /** 種別（type='course' or 'content'）。 */
  type: MediaType
  /** リンク先（B004 or B007 へ）。 */
  href: string
  /** タイトル。 */
  title: string
  /** サムネイル URL。null の場合はプレースホルダ。 */
  thumbnailUrl: string | null
  /** 説明（任意・2 行クランプ）。 */
  description?: string | null
  /** 無料か。 */
  isFree: boolean
  /** 価格（円・有料時）。 */
  price?: number | null
  /** course のみ：章数。 */
  chapterCount?: number
  /** course のみ：動画本数。 */
  videoCount?: number
  /** content のみ：再生時間（"12:34" 等）。 */
  duration?: string | null
  /** 注目バッジ。 */
  isFeatured?: boolean
  /** カテゴリ名（任意）。 */
  categoryName?: string | null
  /** 追加 className。 */
  className?: string
}

const MediaCard = React.forwardRef<HTMLAnchorElement, MediaCardProps>(
  (
    {
      type,
      href,
      title,
      thumbnailUrl,
      description,
      isFree,
      price,
      chapterCount,
      videoCount,
      duration,
      isFeatured = false,
      categoryName,
      className,
    },
    ref,
  ) => {
    const typeLabel = type === 'course' ? 'コース' : '動画'

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
        {/* サムネ */}
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
          {/* 左上：種別バッジ */}
          <div className="absolute left-3 top-3">
            <Badge variant="info">{typeLabel}</Badge>
          </div>
          {/* 右上：注目バッジ */}
          {isFeatured && (
            <div className="absolute right-3 top-3">
              <Badge variant="warning">注目</Badge>
            </div>
          )}
        </div>

        {/* 本体 */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          {/* カテゴリ名（任意・上段に薄表示） */}
          {categoryName && (
            <p className="text-xs text-muted-foreground">{categoryName}</p>
          )}

          {/* タイトル */}
          <h3 className="line-clamp-2 text-base text-foreground group-hover:text-primary md:text-lg">
            {title}
          </h3>

          {/* 説明（任意） */}
          {description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
          )}

          {/* メタ：種別に応じて切替 */}
          <div className="mt-auto flex items-center gap-2">
            {type === 'course'
              ? chapterCount !== undefined && videoCount !== undefined && (
                  <Tag variant="filled" size="sm">
                    {chapterCount} 章 / {videoCount} 動画
                  </Tag>
                )
              : duration && (
                  <Tag variant="filled" size="sm">
                    <Clock aria-hidden="true" className="mr-1 inline-block h-3 w-3" />
                    {duration}
                  </Tag>
                )}
          </div>

          {/* 価格 / 無料 */}
          <div>
            <PriceTag
              free={isFree}
              amount={!isFree && price != null ? price : undefined}
            />
          </div>
        </div>
      </Link>
    )
  },
)
MediaCard.displayName = 'MediaCard'

export { MediaCard }
