import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, FileText, PlayCircle } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { Badge } from '@/app/components/atoms/Badge'
import { FreeBadge } from '@/app/components/atoms/FreeBadge'
import { Button } from '@/app/components/atoms/Button'
import { CourseDetailTemplate } from '@/app/components/templates/CourseDetailTemplate'
import {
  canDownloadCourseMaterials,
  getViewerAccess,
} from '@/app/lib/services/access-service'
import { getCompletedCourseVideoIds } from '@/app/lib/services/progress-service'
import { BookmarkToggleClient } from './_lib/BookmarkToggleClient'
import { CoursePurchaseCtaClient } from './_lib/CoursePurchaseCtaClient'
import { CurriculumAccordionClient } from './_lib/CurriculumAccordionClient'
import { getCourseDetailBySlug } from './_lib/get-course-detail'

/**
 * B004 コース詳細（/e-learning/lp/courses/[slug]）— Server Component
 *
 * 起点：
 * - docs/frontend/screens.md B004
 * - docs/frontend/page-templates.md §CourseDetailTemplate
 *
 * 設計：
 * - 公開コース取得 → 視聴権限・進捗・ブックマーク状態を services 経由で取得 → テンプレに渡す
 * - 未ログイン：A001 ログインへ returnTo 付きリダイレクト
 * - 視聴権限判定は access-service.getViewerAccess（has_full_access / purchased_course_ids）に集約
 * - 進捗マークは progress-service.getCompletedCourseVideoIds
 *
 * 既存 /e-learning/courses（旧単体動画一覧）は完全非破壊
 */

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ELearningLPCourseDetailPage({ params }: PageProps) {
  const { slug } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?returnTo=/e-learning/lp/courses/${encodeURIComponent(slug)}`)
  }

  const course = await getCourseDetailBySlug(slug)
  if (!course) notFound()

  // e_learning_users.id を解決（access-service / progress-service 引数）
  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  // 視聴権限・進捗・資料 DL 可否・ブックマーク状態を並列取得
  let viewerAccess: { has_full_access: boolean; purchased_course_ids: string[]; purchased_content_ids: string[] } = {
    has_full_access: false,
    purchased_course_ids: [],
    purchased_content_ids: [],
  }
  let completedVideoIds: string[] = []
  let canDownloadMaterials = false
  let isBookmarked = false
  let bookmarkId: string | null = null

  if (eLearningUser) {
    const [access, completed, dlAllowed, bookmark] = await Promise.all([
      getViewerAccess(eLearningUser.id),
      getCompletedCourseVideoIds(eLearningUser.id, course.id).catch(() => [] as string[]),
      canDownloadCourseMaterials(eLearningUser.id, course.id),
      supabase
        .from('e_learning_bookmarks')
        .select('id')
        .eq('user_id', eLearningUser.id)
        .eq('course_id', course.id)
        .maybeSingle()
        .then(r => (r.data?.id as string | undefined) ?? null),
    ])
    viewerAccess = access
    completedVideoIds = completed
    canDownloadMaterials = dlAllowed
    bookmarkId = bookmark
    isBookmarked = bookmark !== null
  }

  const hasCourseAccess =
    viewerAccess.has_full_access || viewerAccess.purchased_course_ids.includes(course.id)

  // メタ集計
  const totalVideos = course.chapters.reduce((sum, ch) => sum + ch.videos.length, 0)
  const completedCount = completedVideoIds.length
  const progressPct = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0

  // 「最初から見る」/「続きから見る」の遷移先動画 ID
  const firstVideoId = course.chapters.find(c => c.videos.length > 0)?.videos[0]?.id
  const nextUnwatchedVideoId = (() => {
    for (const chap of course.chapters) {
      for (const v of chap.videos) {
        if (!completedVideoIds.includes(v.id)) return v.id
      }
    }
    return undefined
  })()
  const continueVideoId = nextUnwatchedVideoId ?? firstVideoId

  return (
    <CourseDetailTemplate
      breadcrumb={
        <nav aria-label="パンくず" className="text-sm text-muted-foreground">
          <Link href="/e-learning/lp/courses" className="hover:text-foreground">
            コース一覧
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{course.title}</span>
        </nav>
      }
      hero={
        // Claude Code Academy 風（Kosuke FB 2026-05-15・大改修）：
        // - 外枠なし・サムネだけ独立枠（bg-gray-50 + 余白）
        // - タイトル / 概要 / メタピル / CTA は枠なし直配置
        <section className="flex flex-col gap-5">
          {/* サムネだけ独立枠（beige 風コンテナ） */}
          <div className="rounded-xl bg-gray-50 p-6 sm:p-10">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-white">
              {course.thumbnail_url ? (
                <Image
                  src={course.thumbnail_url}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 70vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <PlayCircle aria-hidden="true" className="h-16 w-16" />
                </div>
              )}
            </div>
          </div>

          {/* バッジ + カテゴリ */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">コース</Badge>
            {course.is_free && <FreeBadge />}
            {course.category_name && (
              <span className="text-xs text-muted-foreground">{course.category_name}</span>
            )}
          </div>

          {/* タイトル */}
          <h1 className="text-2xl text-foreground md:text-3xl">{course.title}</h1>

          {/* 概要 */}
          {course.description && (
            <p className="whitespace-pre-wrap text-sm text-muted-foreground md:text-base">
              {course.description}
            </p>
          )}

          {/* メタピル群（横並び flex-wrap） */}
          <ul className="flex flex-wrap items-center gap-2">
            <li className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700">
              <PlayCircle aria-hidden="true" className="h-4 w-4" />
              {totalVideos} レッスン
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700">
              <BookOpen aria-hidden="true" className="h-4 w-4" />
              {course.chapters.length} 章
            </li>
            {course.materials.length > 0 && (
              <li className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700">
                <FileText aria-hidden="true" className="h-4 w-4" />
                資料 {course.materials.length}
              </li>
            )}
          </ul>

          {/* CTA + ブックマーク */}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {hasCourseAccess && continueVideoId ? (
              <Button asChild size="lg">
                <Link
                  href={`/e-learning/lp/courses/${course.slug}/videos/${continueVideoId}`}
                >
                  {completedCount > 0 ? '続きから見る' : '最初から見る'}
                </Link>
              </Button>
            ) : course.is_free && firstVideoId ? (
              <Button asChild size="lg">
                <Link
                  href={`/e-learning/lp/courses/${course.slug}/videos/${firstVideoId}`}
                >
                  最初から見る
                </Link>
              </Button>
            ) : !course.is_free ? (
              <CoursePurchaseCtaClient
                courseId={course.id}
                courseSlug={course.slug}
                courseTitle={course.title}
                price={course.price}
              />
            ) : null}
            {/* ブックマーク トグル（rounded-full・ロジック維持） */}
            <BookmarkToggleClient
              courseId={course.id}
              courseSlug={course.slug}
              initialBookmarked={isBookmarked}
              initialBookmarkId={bookmarkId}
            />
          </div>

          {hasCourseAccess && totalVideos > 0 && (
            <p className="text-xs text-muted-foreground">
              進捗：{completedCount} / {totalVideos} 本（{progressPct}%）
            </p>
          )}
        </section>
      }
      curriculum={
        // レッスン一覧との区切りに border-t（Claude Code Academy 風）
        <section className="flex flex-col gap-3 border-t border-gray-200 pt-6">
          <h2 className="text-xl text-foreground">カリキュラム</h2>
          <CurriculumAccordionClient
            courseSlug={course.slug}
            courseIsFree={course.is_free}
            hasCourseAccess={hasCourseAccess}
            completedVideoIds={completedVideoIds}
            chapters={course.chapters}
          />
        </section>
      }
      materials={
        course.materials.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl text-foreground">資料</h2>
            {canDownloadMaterials ? (
              <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                {course.materials.map(m => (
                  <li key={m.id} className="flex items-center justify-between px-4 py-3">
                    <span className="truncate text-sm text-foreground">{m.title}</span>
                    <a
                      href={m.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      ダウンロード
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                資料は購入後にダウンロードできます。
              </p>
            )}
          </section>
        ) : null
      }
    />
  )
}
