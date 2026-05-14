import { createClient } from '@/app/lib/supabase/server'

/**
 * B001 LP の注目コース・注目単体動画を取得する Server Component 用ヘルパ。
 *
 * 取得方針：
 * - 公開（is_published=true）かつ論理未削除（deleted_at IS NULL）のみ
 * - 注目フラグ（is_featured=true）の上位 3 件
 * - 個人別情報は含めない（誰でも見られる集計のみ・has_full_access 不参照）
 * - キャッシュなし（Server Component で SSR・ページ単位で fresh）
 */

export type LPFeaturedCourse = {
  id: string
  slug: string
  title: string
  description: string | null
  thumbnail_url: string | null
  is_free: boolean
  price: number | null
}

export type LPFeaturedContent = {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  duration: string | null
  is_free: boolean
  price: number | null
}

export async function getFeaturedCourses(limit = 3): Promise<LPFeaturedCourse[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('e_learning_courses')
    .select('id, slug, title, description, thumbnail_url, is_free, price')
    .eq('is_published', true)
    .is('deleted_at', null)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('[lp] getFeaturedCourses failed', { code: error.code })
    return []
  }
  return (data ?? []) as LPFeaturedCourse[]
}

export async function getFeaturedContents(limit = 4): Promise<LPFeaturedContent[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('e_learning_contents')
    .select('id, title, description, thumbnail_url, duration, is_free, price')
    .eq('is_published', true)
    .is('deleted_at', null)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('[lp] getFeaturedContents failed', { code: error.code })
    return []
  }
  return (data ?? []) as LPFeaturedContent[]
}
