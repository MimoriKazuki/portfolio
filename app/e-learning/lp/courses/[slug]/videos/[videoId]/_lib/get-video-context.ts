import { createClient } from '@/app/lib/supabase/server'

/**
 * B005 コース内動画視聴用：動画情報 + 所属コース + 章内動画リストを 1 リクエストで取得するヘルパ。
 */

export type CourseVideoContext = {
  course: {
    id: string
    slug: string
    title: string
    is_free: boolean
  }
  currentVideo: {
    id: string
    title: string
    description: string | null
    video_url: string
    duration: string | null
    is_free: boolean
  }
  currentChapter: {
    id: string
    title: string
    display_order: number
  }
  /** 章 + 動画のフラット構造（左サイドのレッスンリスト用）。 */
  chapters: Array<{
    id: string
    title: string
    display_order: number
    videos: Array<{
      id: string
      title: string
      duration: string | null
      is_free: boolean
      display_order: number
    }>
  }>
}

export async function getCourseVideoContext(
  slug: string,
  videoId: string,
): Promise<CourseVideoContext | null> {
  const supabase = await createClient()

  const { data: video, error: videoError } = await supabase
    .from('e_learning_course_videos')
    .select(
      `id, title, description, video_url, duration, is_free,
       chapter:e_learning_course_chapters!inner(
         id, title, display_order, course_id,
         course:e_learning_courses!inner(id, slug, title, is_free, is_published, deleted_at)
       )`,
    )
    .eq('id', videoId)
    .maybeSingle()

  if (videoError || !video) {
    if (videoError) console.error('[b005] video fetch failed', { code: videoError.code, videoId })
    return null
  }

  const chapter = (video as unknown as { chapter: unknown }).chapter
  const chapterObj = Array.isArray(chapter)
    ? (chapter[0] as {
        id: string
        title: string
        display_order: number
        course_id: string
        course: { id: string; slug: string; title: string; is_free: boolean; is_published: boolean; deleted_at: string | null } | Array<{ id: string; slug: string; title: string; is_free: boolean; is_published: boolean; deleted_at: string | null }>
      })
    : (chapter as {
        id: string
        title: string
        display_order: number
        course_id: string
        course: { id: string; slug: string; title: string; is_free: boolean; is_published: boolean; deleted_at: string | null } | Array<{ id: string; slug: string; title: string; is_free: boolean; is_published: boolean; deleted_at: string | null }>
      })

  if (!chapterObj) return null

  const courseRaw = Array.isArray(chapterObj.course) ? chapterObj.course[0] : chapterObj.course
  if (!courseRaw) return null

  // slug 一致・公開・未削除のみ受け入れ
  if (
    courseRaw.slug !== slug ||
    courseRaw.is_published === false ||
    courseRaw.deleted_at !== null
  ) {
    return null
  }

  // 同コースの章 + 動画一覧（サイドバー用）を別クエリで取得
  const { data: chapters, error: chaptersError } = await supabase
    .from('e_learning_course_chapters')
    .select(
      `id, title, display_order,
       videos:e_learning_course_videos(id, title, duration, is_free, display_order)`,
    )
    .eq('course_id', courseRaw.id)
    .order('display_order', { ascending: true })

  if (chaptersError) {
    console.error('[b005] chapters fetch failed', { code: chaptersError.code })
  }

  const sortedChapters = ((chapters ?? []) as Array<{
    id: string
    title: string
    display_order: number
    videos: Array<{ id: string; title: string; duration: string | null; is_free: boolean; display_order: number }>
  }>).map(ch => ({
    ...ch,
    videos: [...(ch.videos ?? [])].sort((a, b) => a.display_order - b.display_order),
  }))

  return {
    course: {
      id: courseRaw.id,
      slug: courseRaw.slug,
      title: courseRaw.title,
      is_free: courseRaw.is_free,
    },
    currentVideo: {
      id: (video as { id: string }).id,
      title: (video as { title: string }).title,
      description: (video as { description: string | null }).description,
      video_url: (video as { video_url: string }).video_url,
      duration: (video as { duration: string | null }).duration,
      is_free: (video as { is_free: boolean }).is_free,
    },
    currentChapter: {
      id: chapterObj.id,
      title: chapterObj.title,
      display_order: chapterObj.display_order,
    },
    chapters: sortedChapters,
  }
}
