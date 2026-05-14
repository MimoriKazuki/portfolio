import { createClient } from '@/app/lib/supabase/server'

/**
 * C008 カリキュラム編集：章 + 動画一覧の admin 用取得ヘルパ。
 *
 * 公開フィルタを掛けない（is_published=false / deleted_at != null のコースでも編集可能にするため）。
 */

export type CurriculumChapter = {
  id: string
  course_id: string
  title: string
  description: string | null
  display_order: number
  videos: Array<{
    id: string
    chapter_id: string
    title: string
    description: string | null
    video_url: string
    duration: string | null
    is_free: boolean
    display_order: number
  }>
}

export async function getCourseCurriculum(courseId: string): Promise<CurriculumChapter[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('e_learning_course_chapters')
    .select(
      `id, course_id, title, description, display_order,
       videos:e_learning_course_videos(id, chapter_id, title, description, video_url, duration, is_free, display_order)`,
    )
    .eq('course_id', courseId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[c008] getCourseCurriculum failed', { code: error.code, courseId })
    return []
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string
    course_id: string
    title: string
    description: string | null
    display_order: number
    videos: Array<{
      id: string
      chapter_id: string
      title: string
      description: string | null
      video_url: string
      duration: string | null
      is_free: boolean
      display_order: number
    }>
  }>

  return rows.map(ch => ({
    ...ch,
    videos: [...(ch.videos ?? [])].sort((a, b) => a.display_order - b.display_order),
  }))
}
