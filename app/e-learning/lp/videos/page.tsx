import Link from 'next/link'
import { Badge } from '@/app/components/atoms/Badge'
import { FreeBadge } from '@/app/components/atoms/FreeBadge'
import { MediaGrid } from '@/app/components/organisms/MediaGrid'
import { MediaListTemplate } from '@/app/components/templates/MediaListTemplate'
import { MediaListFilterBarClient } from '@/app/e-learning/lp/_lib/MediaListFilterBarClient'
import { getActiveCategories } from '@/app/e-learning/lp/courses/_lib/get-courses-list'
import {
  getVideosList,
  type VideoListItem,
  type VideosListFilters,
} from './_lib/get-videos-list'

/**
 * B003 単体動画一覧（/e-learning/lp/videos）— Server Component
 *
 * 起点：
 * - docs/frontend/screens.md B006（単体動画一覧）
 * - docs/frontend/page-templates.md §MediaListTemplate
 *
 * 設計：
 * - Server Component で URL query を読み、SSR でフィルタ適用済み一覧を取得
 * - フィルタ操作は MediaListFilterBarClient が URL query を書き換える
 * - 既存 /e-learning/courses（旧単体動画一覧）は完全非破壊
 *
 * Phase 3 中は /e-learning/lp/videos 配下に集約・P3-CLEANUP-01 で /e-learning/videos へ移管予定
 */

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseFilters(
  sp: Record<string, string | string[] | undefined>,
): VideosListFilters {
  const get = (key: string): string | undefined => {
    const v = sp[key]
    return Array.isArray(v) ? v[0] : v
  }

  const categoriesParam = get('categories')
  const categoryIds = categoriesParam
    ? categoriesParam.split(',').filter(Boolean)
    : undefined

  const freeParam = get('free')
  const freeFilter: VideosListFilters['freeFilter'] =
    freeParam === 'free' || freeParam === 'paid' ? freeParam : 'all'

  const keyword = get('q')

  return { categoryIds, freeFilter, keyword }
}

function VideoListCard({ video }: { video: VideoListItem }) {
  return (
    <Link
      href={`/e-learning/${video.id}`}
      className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-5 text-card-foreground transition hover:border-primary"
      aria-label={`${video.title} の詳細を見る`}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge variant="neutral">単体動画</Badge>
        {video.is_free ? (
          <FreeBadge />
        ) : video.price !== null ? (
          <span className="text-sm text-foreground">¥{video.price.toLocaleString()}</span>
        ) : null}
      </div>
      <h3 className="text-base text-foreground group-hover:text-primary md:text-lg">
        {video.title}
      </h3>
      {video.description && (
        <p className="line-clamp-3 text-sm text-muted-foreground">{video.description}</p>
      )}
      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
        {video.category_name && <span>{video.category_name}</span>}
        {video.duration && <span>{video.duration}</span>}
      </div>
    </Link>
  )
}

export default async function ELearningLPVideosPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const filters = parseFilters(sp)

  const [videos, categories] = await Promise.all([
    getVideosList(filters),
    getActiveCategories(),
  ])

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }))

  return (
    <MediaListTemplate
      header={
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl text-foreground md:text-3xl">単体動画一覧</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            気になるテーマをピンポイントで学べる単体動画。カテゴリ・無料／有料・キーワードで絞り込めます。
          </p>
        </div>
      }
      filterBar={<MediaListFilterBarClient categories={categoryOptions} />}
      grid={
        <MediaGrid isEmpty={videos.length === 0}>
          {videos.map(video => (
            <VideoListCard key={video.id} video={video} />
          ))}
        </MediaGrid>
      }
    />
  )
}
