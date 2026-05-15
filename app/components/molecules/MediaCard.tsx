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
 * - Kosuke 最終確定（2026-05-15）：既存 ELearningCard と完全同一構造
 *
 * 構成（最終形）：
 * - 上部：aspect-video サムネ
 *   - type='content' のみ：サムネ左上に「単体動画」緑 border バッジ overlay
 *   - type='course'：バッジ overlay なし
 * - 本体：
 *   - タイトル（2 行クランプ）
 *   - 概要文（line-clamp-3・任意）
 *   - 下段：金額テキスト（左）+ カテゴリバッジ（右）両端寄せ
 *
 * 【props 互換性】
 * isFeatured / chapterCount / videoCount / duration は props として保持するが UI 上は表示しない。
 *
 * 非破壊：既存 CourseCard / FreeBadge / PriceTag / ui/ / LP / admin に影響なし。
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
  /** 概要文（タイトル下に line-clamp-3 表示・任意）。 */
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
      description,
      isFree,
      price,
      categoryName,
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
          // 既存運用カード（ProjectCard / ELearningCard / コラム）と統一フレーム + 内側パディング p-4
          'group flex h-full flex-col overflow-hidden rounded border-2 border-transparent transition-colors duration-300 hover:border-gray-200 p-4',
          className,
        )}
      >
        {/* サムネ：パディング内に収め、角丸＋オーバーフロー隠しで丸い縁 */}
        <div className="relative aspect-video w-full overflow-hidden rounded bg-muted">
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

          {/* type='content' 時のみサムネ左上に「単体動画」バッジ overlay（既存 ELearningCard の無料バッジ位置と同パターン） */}
          {/* ホバー時はフェードアウト（既存 ELearningCard と同流儀） */}
          {type === 'content' && (
            <span className="absolute top-2 left-2 inline-flex items-center bg-white text-xs px-3 py-1 border border-green-200 text-green-700 font-medium transition-opacity duration-300 group-hover:opacity-0">
              単体動画
            </span>
          )}
        </div>

        {/* 本体（左右パディングは外側 p-4 に委譲し、上下のみ pt-4 で間隔確保） */}
        <div className="flex flex-1 flex-col gap-2 pt-4">
          {/* タイトル（2 行クランプ） */}
          <h3 className="line-clamp-2 text-base text-foreground group-hover:text-primary md:text-lg">
            {title}
          </h3>

          {/* 概要文（任意・line-clamp-3） */}
          {description && (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {description}
            </p>
          )}

          {/* 下段：金額テキスト（左）+ カテゴリバッジ（右）両端寄せ */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            {/* 左：金額（やや視認性を上げて text-sm に拡大・Kosuke FB） */}
            {isFree ? (
              <span className="text-sm text-muted-foreground">無料</span>
            ) : price != null ? (
              <span className="text-sm text-gray-900">
                ¥{price.toLocaleString()}
              </span>
            ) : (
              <span />
            )}

            {/* 右：カテゴリバッジ（既存カード border パターン） */}
            {categoryName ? (
              <span className="inline-flex items-center bg-white text-xs px-3 py-1 border border-gray-200 text-gray-700 font-medium">
                {categoryName}
              </span>
            ) : (
              <span />
            )}
          </div>
        </div>
      </Link>
    )
  },
)
MediaCard.displayName = 'MediaCard'

export { MediaCard }
