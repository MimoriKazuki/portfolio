import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/app/lib/supabase/server'
import { Button } from '@/app/components/atoms/Button'
import { FreeBadge } from '@/app/components/atoms/FreeBadge'
import { ProgressCheckIcon } from '@/app/components/atoms/ProgressCheckIcon'
import { LockIcon } from '@/app/components/atoms/LockIcon'
import { VideoPlayerTemplate } from '@/app/components/templates/VideoPlayerTemplate'
import { canViewCourseVideo } from '@/app/lib/services/access-service'
import { getCompletedCourseVideoIds } from '@/app/lib/services/progress-service'
import { CompleteButtonClient } from './_lib/CompleteButtonClient'
import { CourseVideoPlayer } from './_lib/CourseVideoPlayer'
import { getCourseVideoContext } from './_lib/get-video-context'

/**
 * B005 コース内動画視聴（/e-learning/lp/courses/[slug]/videos/[videoId]）— Server Component
 *
 * 起点：
 * - docs/frontend/screens.md B005
 * - docs/frontend/page-templates.md §VideoPlayerTemplate
 *
 * 設計：
 * - access-service.canViewCourseVideo で 5 段階優先順位通り視聴可否判定
 * - 拒否時は B004 コース詳細にリダイレクト
 * - VideoPlayerTemplate（Udemy 風 2 カラム）：左サイド = 章 + 動画リスト / 右 = プレイヤー + タブ
 * - 進捗マーク：CompleteButtonClient（Server Action 経由で progress-service 連携）
 * - 「次のレッスン」誘導：同章 / 次章の動画 ID を解決して URL リンク
 *
 * NG ルール遵守：
 * - 視聴可否判定は access-service に集約（独自判定なし）
 * - has_paid_access 参照なし
 */

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string; videoId: string }>
}

export default async function ELearningLPCourseVideoPage({ params }: PageProps) {
  const { slug, videoId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect(
      `/auth/login?returnTo=/e-learning/lp/courses/${encodeURIComponent(slug)}/videos/${encodeURIComponent(videoId)}`,
    )
  }

  // 動画・コース・章コンテキスト取得（slug 一致・公開のみ）
  const ctx = await getCourseVideoContext(slug, videoId)
  if (!ctx) notFound()

  // e_learning_users.id 解決
  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  // 視聴権限判定（access-service 単一判定）
  const access = eLearningUser
    ? await canViewCourseVideo(eLearningUser.id, videoId)
    : { allowed: false, reason: 'not_purchased' as const }

  if (!access.allowed) {
    // 視聴拒否 → コース詳細にフォールバック（B004 側で購入 CTA を表示）
    redirect(`/e-learning/lp/courses/${encodeURIComponent(slug)}?denied=1`)
  }

  // 進捗（視聴済 ID 配列）取得
  const completedVideoIds = eLearningUser
    ? await getCompletedCourseVideoIds(eLearningUser.id, ctx.course.id).catch(
        () => [] as string[],
      )
    : []
  const completedSet = new Set(completedVideoIds)
  const isCurrentCompleted = completedSet.has(videoId)

  // 次のレッスン候補（同章 → 次章先頭）
  const flatVideos = ctx.chapters.flatMap(ch => ch.videos.map(v => ({ ...v, chapterId: ch.id })))
  const currentIdx = flatVideos.findIndex(v => v.id === videoId)
  const nextVideo = currentIdx >= 0 ? flatVideos[currentIdx + 1] : undefined

  return (
    <VideoPlayerTemplate
      breadcrumb={
        <nav aria-label="パンくず" className="flex items-center gap-2 text-sm">
          <Link
            href={`/e-learning/lp/courses/${ctx.course.slug}`}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            コース詳細に戻る
          </Link>
        </nav>
      }
      topbar={
        nextVideo ? (
          <Button asChild variant="outline" size="sm">
            <Link
              href={`/e-learning/lp/courses/${ctx.course.slug}/videos/${nextVideo.id}`}
            >
              次のレッスン
              <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : null
      }
      sidebar={
        <nav aria-label="レッスン一覧" className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">{ctx.course.title}</p>
          {ctx.chapters.map(chapter => (
            <section key={chapter.id} className="flex flex-col gap-1">
              <h3 className="text-sm text-foreground">
                第{chapter.display_order}章：{chapter.title}
              </h3>
              <ul className="flex flex-col">
                {chapter.videos.map(v => {
                  const isActive = v.id === videoId
                  const isDone = completedSet.has(v.id)
                  const isLocked =
                    !ctx.course.is_free &&
                    !v.is_free &&
                    !isActive &&
                    !isDone &&
                    !access.allowed
                  return (
                    <li key={v.id}>
                      <Link
                        href={`/e-learning/lp/courses/${ctx.course.slug}/videos/${v.id}`}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm transition ${
                          isActive
                            ? 'bg-primary/10 text-foreground'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                      >
                        <ProgressCheckIcon
                          variant={isDone ? 'completed' : 'pending'}
                          size="sm"
                          aria-label={isDone ? '視聴完了' : '未視聴'}
                        />
                        <span className="flex-1 truncate">{v.title}</span>
                        {v.is_free && <FreeBadge size="sm" />}
                        {isLocked && <LockIcon size="sm" aria-label="視聴権限なし" />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </nav>
      }
      player={
        <div className="flex flex-col gap-4">
          <CourseVideoPlayer videoUrl={ctx.currentVideo.video_url} title={ctx.currentVideo.title} />
          <header className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              第{ctx.currentChapter.display_order}章：{ctx.currentChapter.title}
            </p>
            <h1 className="text-xl text-foreground md:text-2xl">{ctx.currentVideo.title}</h1>
          </header>
          <CompleteButtonClient
            courseSlug={ctx.course.slug}
            courseVideoId={ctx.currentVideo.id}
            initialCompleted={isCurrentCompleted}
          />
        </div>
      }
      tabs={
        ctx.currentVideo.description ? (
          // B007 と同じトーン（rounded-xl + bg-gray-50・Kosuke FB 2026-05-15）
          <section className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-base text-foreground">概要</h2>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {ctx.currentVideo.description}
            </p>
          </section>
        ) : null
      }
    />
  )
}
