import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { Button } from '@/app/components/atoms/Button'
import { EmptyState } from '@/app/components/molecules/EmptyState'
import { ProgressBar } from '@/app/components/atoms/ProgressBar'
import { MyPageTemplate } from '@/app/components/templates/MyPageTemplate'
import { MyPageSidebarClient } from '@/app/e-learning/lp/mypage/_lib/MyPageSidebarClient'
import {
  getMyProgress,
  type ContentProgressEntry,
  type CourseProgressEntry,
} from './_lib/get-progress'

/**
 * B013 マイページ：視聴履歴（/e-learning/lp/mypage/progress）— Server Component
 *
 * 起点：
 * - docs/frontend/screens.md B013
 *
 * 設計：
 * - 自分の e_learning_progress を取得し、コース別 + 単体動画別に分けて表示
 * - コース別：progress-service.getCourseProgress で total/completed・「次のレッスン」リンク（次の未完了動画）
 * - 単体動画：完了日時順
 *
 * 個人別情報のため認証必須
 */

export const dynamic = 'force-dynamic'

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return iso
  }
}

function CourseProgressRow({ entry }: { entry: CourseProgressEntry }) {
  const pct = entry.total > 0 ? Math.round((entry.completed / entry.total) * 100) : 0
  const isCompleted = entry.total > 0 && entry.completed >= entry.total
  const nextHref = entry.next_video_id
    ? `/e-learning/lp/courses/${entry.course_slug}/videos/${entry.next_video_id}`
    : `/e-learning/lp/courses/${entry.course_slug}`

  return (
    <li className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/e-learning/lp/courses/${entry.course_slug}`}
          className="truncate text-sm text-foreground hover:text-primary"
        >
          {entry.course_title}
        </Link>
        <Button asChild size="sm" variant={isCompleted ? 'outline' : 'primary'}>
          <Link href={nextHref}>
            {isCompleted ? 'もう一度視聴' : '次のレッスン'}
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <ProgressBar value={pct} className="flex-1" />
        <span className="text-xs text-muted-foreground">
          {entry.completed} / {entry.total}（{pct}%）
        </span>
      </div>
      {entry.last_completed_at && (
        <p className="text-xs text-muted-foreground">
          最終視聴：{formatDate(entry.last_completed_at)}
        </p>
      )}
    </li>
  )
}

function ContentProgressRow({ entry }: { entry: ContentProgressEntry }) {
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={`/e-learning/${entry.content_id}`}
          className="truncate text-sm text-foreground hover:text-primary"
        >
          {entry.content_title ?? '（タイトル不明）'}
        </Link>
        <p className="text-xs text-muted-foreground">
          {formatDate(entry.completed_at)} 視聴完了
        </p>
      </div>
      <Button asChild size="sm" variant="outline">
        <Link href={`/e-learning/${entry.content_id}`}>もう一度視聴</Link>
      </Button>
    </li>
  )
}

export default async function ELearningLPMyProgressPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?returnTo=/e-learning/lp/mypage/progress')
  }

  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const progress = eLearningUser
    ? await getMyProgress(eLearningUser.id)
    : { courses: [], contents: [] }

  const isEmpty = progress.courses.length === 0 && progress.contents.length === 0

  return (
    <MyPageTemplate
      header={
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-foreground md:text-3xl">視聴履歴</h1>
          <p className="text-sm text-muted-foreground">
            これまで視聴したコース・単体動画の進捗を確認できます。
          </p>
        </header>
      }
      sidebar={<MyPageSidebarClient />}
    >
      <div className="flex flex-col gap-6">
        {isEmpty ? (
          <EmptyState
            title="視聴履歴はまだありません"
            description="コースや単体動画を視聴完了するとここに表示されます。"
            action={
              <Button asChild>
                <Link href="/e-learning/lp/courses">コース一覧へ</Link>
              </Button>
            }
          />
        ) : (
          <>
            {progress.courses.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-lg text-foreground">コース</h2>
                <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card text-card-foreground">
                  {progress.courses.map(c => (
                    <CourseProgressRow key={c.course_id} entry={c} />
                  ))}
                </ul>
              </section>
            )}

            {progress.contents.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-lg text-foreground">単体動画</h2>
                <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card text-card-foreground">
                  {progress.contents.map(c => (
                    <ContentProgressRow key={c.content_id} entry={c} />
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </MyPageTemplate>
  )
}
