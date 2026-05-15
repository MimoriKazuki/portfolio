import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle } from 'lucide-react'
import { cn } from '@/app/lib/utils'

/**
 * MediaCard molecule（Atomic Design / molecules）
 *
 * 起点：
 * - team-lead 指示「B002 統合一覧（コース + 単体動画混在）」
 * - CourseCard を拡張し、コース / 単体動画 両対応にしたカード
 *
 * 構成（Kosuke フィードバック反映・2026-05-15）：
 * - 上部：aspect-video サムネ（バッジ overlay なし・純粋な画像）
 * - フッタ：
 *   - タイトル（2 行クランプ）
 *   - カテゴリ名（小・muted）
 *   - 下段：左に「価格 / 無料」、右に「コース / 単体動画」テキスト（両端寄せ）
 *
 * 【props 互換性】
 * description / isFeatured / chapterCount / videoCount / duration は props として保持するが
 * UI 上では表示しない（B003 等の将来再利用 + 既存テスト破壊回避）。
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
  /** 説明（props 保持・現バージョンでは表示しない）。 */
  description?: string | null
  /** 無料か。 */
  isFree: boolean
  /** 価格（円・有料時）。 */
  price?: number | null
  /** course のみ：章数（props 保持・現バージョンでは非表示）。 */
  chapterCount?: number
  /** course のみ：動画本数（props 保持・現バージョンでは非表示）。 */
  videoCount?: number
  /** content のみ：再生時間（props 保持・現バージョンでは非表示）。 */
  duration?: string | null
  /** 注目バッジ（props 保持・現バージョンでは非表示）。 */
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
      isFree,
      price,
      categoryName,
      className,
    },
    ref,
  ) => {
    const typeLabel = type === 'course' ? 'コース' : '単体動画'

    return (
      <Link
        ref={ref}
        href={href}
        aria-label={`${title} の詳細を見る`}
        className={cn(
          // 既存運用カード（ProjectCard / ELearningCard / コラム）と統一：
          // 背景色なし / 透明 border-2 / hover で gray-200・transition-colors duration-300 / rounded（md 相当）
          'group flex h-full flex-col overflow-hidden rounded border-2 border-transparent transition-colors duration-300 hover:border-gray-200',
          className,
        )}
      >
        {/* サムネ（バッジ overlay なし・純粋な画像） */}
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
        </div>

        {/* 本体 */}
        <div className="flex flex-1 flex-col gap-2 p-5">
          {/* タイトル（2 行クランプ） */}
          <h3 className="line-clamp-2 text-base text-foreground group-hover:text-primary md:text-lg">
            {title}
          </h3>

          {/* カテゴリ名（任意・既存カード共通の border バッジパターン） */}
          {categoryName && (
            <span className="inline-flex w-fit items-center bg-white text-xs px-3 py-1 border border-gray-200 text-gray-700 font-medium">
              {categoryName}
            </span>
          )}

          {/* 下段：金額（左・既存カード border バッジ統一）+ 種別テキスト（右）両端寄せ */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            {isFree ? (
              <span className="inline-flex items-center bg-white text-xs px-3 py-1 border border-green-200 text-green-700 font-medium">
                無料
              </span>
            ) : price != null ? (
              <span className="inline-flex items-center bg-white text-xs px-3 py-1 border border-gray-200 text-gray-900 font-medium">
                ¥{price.toLocaleString()}
              </span>
            ) : (
              <span />
            )}
            <span className="text-xs text-muted-foreground">{typeLabel}</span>
          </div>
        </div>
      </Link>
    )
  },
)
MediaCard.displayName = 'MediaCard'

export { MediaCard }
