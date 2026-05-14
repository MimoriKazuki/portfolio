import { createClient } from '@/app/lib/supabase/server'

/**
 * B004 コース詳細（/e-learning/lp/courses/[slug]）用の Server Component データ取得ヘルパ。
 *
 * 取得方針：
 * - 公開（is_published=true）かつ論理未削除（deleted_at IS NULL）のみ
 * - 章 + 動画を JOIN で 1 クエリ取得（display_order 昇順）
 * - 関連 e_learning_materials（course_id 一致）を別クエリで取得
 * - 個人別情報（progress / bookmark）は呼び出し側で個別取得（services 層経由）
 */

export type CourseDetail = {
  id: string
  slug: string
  title: string
  description: string | null
  thumbnail_url: string | null
  is_free: boolean
  price: number | null
  category_id: string
  category_name: string | null
  chapters: Array<{
    id: string
    title: string
    description: string | null
    display_order: number
    videos: Array<{
      id: string
      title: string
      description: string | null
      duration: string | null
      is_free: boolean
      display_order: number
    }>
  }>
  materials: Array<{
    id: string
    title: string
    file_url: string
    file_size: number | null
    display_order: number
  }>
}

export async function getCourseDetailBySlug(slug: string): Promise<CourseDetail | null> {
  const supabase = await createClient()

  // コース + 章 + 動画を 1 クエリ取得（ネスト JOIN）
  const { data: course, error: courseError } = await supabase
    .from('e_learning_courses')
    .select(
      `id, slug, title, description, thumbnail_url, is_free, price, category_id,
       category:e_learning_categories(name),
       chapters:e_learning_course_chapters(
         id, title, description, display_order,
         videos:e_learning_course_videos(id, title, description, duration, is_free, display_order)
       )`,
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .is('deleted_at', null)
    .maybeSingle()

  if (courseError) {
    console.error('[b004] getCourseDetailBySlug failed', { code: courseError.code, slug })
    return null
  }
  if (!course) return null

  // 資料（コース直下のみ・コース内動画個別資料は持たない・M1 確定）
  const { data: materials, error: materialsError } = await supabase
    .from('e_learning_materials')
    .select('id, title, file_url, file_size, display_order')
    .eq('course_id', course.id)
    .order('display_order', { ascending: true })

  if (materialsError) {
    console.error('[b004] materials fetch failed', { code: materialsError.code, slug })
  }

  // category の正規化（Supabase to-one が配列で返るケースを吸収）
  const rawCategory = (course as unknown as { category: unknown }).category
  const cat = Array.isArray(rawCategory)
    ? (rawCategory[0] as { name: string | null } | undefined)
    : (rawCategory as { name: string | null } | null)

  // 章を display_order でソートし、各章の動画も display_order でソート
  const rawChapters = ((course as unknown as { chapters: Array<{
    id: string
    title: string
    description: string | null
    display_order: number
    videos: Array<{
      id: string
      title: string
      description: string | null
      duration: string | null
      is_free: boolean
      display_order: number
    }>
  }> }).chapters ?? [])

  const chapters = [...rawChapters]
    .sort((a, b) => a.display_order - b.display_order)
    .map(ch => ({
      ...ch,
      videos: [...(ch.videos ?? [])].sort((a, b) => a.display_order - b.display_order),
    }))

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    thumbnail_url: course.thumbnail_url,
    is_free: course.is_free,
    price: course.price,
    category_id: course.category_id,
    category_name: cat?.name ?? null,
    chapters,
    materials: (materials ?? []) as CourseDetail['materials'],
  }
}
