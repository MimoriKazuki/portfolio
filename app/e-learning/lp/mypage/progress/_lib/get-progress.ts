import { createClient } from '@/app/lib/supabase/server'
import { getCourseProgress } from '@/app/lib/services/progress-service'

/**
 * B013 マイページ：視聴履歴の Server Component 用データ取得ヘルパ。
 *
 * 設計：
 * - 自分（user_id 一致）の e_learning_progress を取得
 * - コース内動画完了は所属コース別にグループ化 → progress-service.getCourseProgress で total/completed 取得
 * - 単体動画完了は個別表示
 * - 個人別情報のため RLS 経由（progress-service と同じ anon クライアント）
 */

export type CourseProgressEntry = {
  course_id: string
  course_slug: string
  course_title: string
  completed: number
  total: number
  last_completed_at: string | null
  /** 次に視聴すべき動画 ID（未完了動画の先頭） */
  next_video_id: string | null
}

export type ContentProgressEntry = {
  content_id: string
  content_title: string | null
  completed_at: string
}

export type MyProgress = {
  courses: CourseProgressEntry[]
  contents: ContentProgressEntry[]
}

export async function getMyProgress(userId: string): Promise<MyProgress> {
  const supabase = await createClient()

  // 自分の progress 一覧（コース動画 + 単体動画）
  const { data: progressRows, error: progressError } = await supabase
    .from('e_learning_progress')
    .select(
      `id, course_video_id, content_id, completed_at,
       course_video:e_learning_course_videos (
         id,
         chapter:e_learning_course_chapters!inner (
           course_id,
           course:e_learning_courses!inner ( id, slug, title )
         )
       ),
       content:e_learning_contents ( id, title )`,
    )
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (progressError) {
    console.error('[b013] progress fetch failed', { code: progressError.code })
    return { courses: [], contents: [] }
  }

  type Row = {
    id: string
    course_video_id: string | null
    content_id: string | null
    completed_at: string
    course_video: unknown
    content: unknown
  }

  const rows = (progressRows ?? []) as unknown as Row[]

  // コース別にグループ化
  type CourseAcc = { id: string; slug: string; title: string; last_completed_at: string | null }
  const courseAccMap = new Map<string, CourseAcc>()
  const contents: ContentProgressEntry[] = []

  for (const r of rows) {
    if (r.course_video_id) {
      // JOIN 結果の正規化
      const cvRaw = Array.isArray(r.course_video) ? r.course_video[0] : r.course_video
      const chapterRaw = cvRaw && typeof cvRaw === 'object' ? (cvRaw as { chapter: unknown }).chapter : null
      const chapter = Array.isArray(chapterRaw) ? chapterRaw[0] : chapterRaw
      const courseRaw =
        chapter && typeof chapter === 'object' ? (chapter as { course: unknown }).course : null
      const course = Array.isArray(courseRaw) ? courseRaw[0] : courseRaw

      if (course && typeof course === 'object') {
        const c = course as { id: string; slug: string; title: string }
        const existing = courseAccMap.get(c.id)
        if (!existing) {
          courseAccMap.set(c.id, {
            id: c.id,
            slug: c.slug,
            title: c.title,
            last_completed_at: r.completed_at,
          })
        }
      }
    } else if (r.content_id) {
      const contentRaw = Array.isArray(r.content) ? r.content[0] : r.content
      const contentObj =
        contentRaw && typeof contentRaw === 'object'
          ? (contentRaw as { id: string; title: string | null })
          : null
      contents.push({
        content_id: r.content_id,
        content_title: contentObj?.title ?? null,
        completed_at: r.completed_at,
      })
    }
  }

  // コースごとに total/completed と次のレッスンを取得（progress-service 経由）
  const courses: CourseProgressEntry[] = []
  for (const acc of courseAccMap.values()) {
    const { total, completed } = await getCourseProgress(userId, acc.id).catch(() => ({
      total: 0,
      completed: 0,
    }))

    // 次の未完了動画 ID 取得（章 + 動画一覧 → 未完了の先頭）
    const { data: chaptersData } = await supabase
      .from('e_learning_course_chapters')
      .select(
        `id, display_order,
         videos:e_learning_course_videos(id, display_order)`,
      )
      .eq('course_id', acc.id)
      .order('display_order', { ascending: true })

    let nextVideoId: string | null = null
    if (chaptersData && total > 0 && completed < total) {
      const { data: completedRows } = await supabase
        .from('e_learning_progress')
        .select('course_video_id')
        .eq('user_id', userId)
        .not('course_video_id', 'is', null)
      const completedSet = new Set(
        ((completedRows ?? []) as Array<{ course_video_id: string | null }>).map(r => r.course_video_id),
      )
      for (const ch of chaptersData as Array<{
        id: string
        display_order: number
        videos: Array<{ id: string; display_order: number }>
      }>) {
        const sorted = [...(ch.videos ?? [])].sort((a, b) => a.display_order - b.display_order)
        const found = sorted.find(v => !completedSet.has(v.id))
        if (found) {
          nextVideoId = found.id
          break
        }
      }
    }

    courses.push({
      course_id: acc.id,
      course_slug: acc.slug,
      course_title: acc.title,
      completed,
      total,
      last_completed_at: acc.last_completed_at,
      next_video_id: nextVideoId,
    })
  }

  return { courses, contents }
}
