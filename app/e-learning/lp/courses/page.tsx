import Link from 'next/link'
import { Badge } from '@/app/components/atoms/Badge'
import { FreeBadge } from '@/app/components/atoms/FreeBadge'
import { MediaGrid } from '@/app/components/organisms/MediaGrid'
import { MediaListTemplate } from '@/app/components/templates/MediaListTemplate'
import { MediaListFilterBarClient } from '@/app/e-learning/lp/_lib/MediaListFilterBarClient'
import {
  getActiveCategories,
  getCoursesList,
  type CourseListItem,
  type CoursesListFilters,
} from './_lib/get-courses-list'

/**
 * B002 コース一覧（/e-learning/lp/courses）— Server Component
 *
 * 起点：
 * - docs/frontend/screens.md B003（コース一覧）
 * - docs/frontend/page-templates.md §MediaListTemplate
 *
 * 設計：
 * - Server Component で URL query を読み、SSR でフィルタ適用済み一覧を取得
 * - フィルタ操作はクライアント側 MediaListFilterBarClient が URL query を書き換える
 *   → URL が単一の真の源（再読込・共有時にも状態が保持される）
 * - 既存 /e-learning/courses（旧単体動画一覧）は完全非破壊
 *
 * Phase 3 中は /e-learning/lp/courses 配下に集約・P3-CLEANUP-01 で /e-learning/courses へ移管予定
 */

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseFilters(
  sp: Record<string, string | string[] | undefined>,
): CoursesListFilters {
  const get = (key: string): string | undefined => {
    const v = sp[key]
    return Array.isArray(v) ? v[0] : v
  }

  const categoriesParam = get('categories')
  const categoryIds = categoriesParam
    ? categoriesParam.split(',').filter(Boolean)
    : undefined

  const freeParam = get('free')
  const freeFilter: CoursesListFilters['freeFilter'] =
    freeParam === 'free' || freeParam === 'paid' ? freeParam : 'all'

  const keyword = get('q')

  return { categoryIds, freeFilter, keyword }
}

function CourseListCard({ course }: { course: CourseListItem }) {
  return (
    <Link
      href={`/e-learning/courses/${course.slug}`}
      className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-5 text-card-foreground transition hover:border-primary"
      aria-label={`${course.title} の詳細を見る`}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge variant="info">コース</Badge>
        {course.is_free ? (
          <FreeBadge />
        ) : course.price !== null ? (
          <span className="text-sm text-foreground">¥{course.price.toLocaleString()}</span>
        ) : null}
      </div>
      <h3 className="text-base text-foreground group-hover:text-primary md:text-lg">
        {course.title}
      </h3>
      {course.description && (
        <p className="line-clamp-3 text-sm text-muted-foreground">{course.description}</p>
      )}
      {course.category_name && (
        <p className="mt-auto text-xs text-muted-foreground">{course.category_name}</p>
      )}
    </Link>
  )
}

export default async function ELearningLPCoursesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const filters = parseFilters(sp)

  const [courses, categories] = await Promise.all([
    getCoursesList(filters),
    getActiveCategories(),
  ])

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }))

  return (
    <MediaListTemplate
      header={
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl text-foreground md:text-3xl">コース一覧</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            体系的に学べるコースを探す。カテゴリ・無料／有料・キーワードで絞り込めます。
          </p>
        </div>
      }
      filterBar={<MediaListFilterBarClient categories={categoryOptions} />}
      grid={
        <MediaGrid isEmpty={courses.length === 0}>
          {courses.map(course => (
            <CourseListCard key={course.id} course={course} />
          ))}
        </MediaGrid>
      }
    />
  )
}
