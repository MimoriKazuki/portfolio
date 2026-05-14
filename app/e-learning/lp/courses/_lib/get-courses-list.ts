import { createClient } from '@/app/lib/supabase/server'

/**
 * B002 コース一覧（/e-learning/lp/courses）用の Server Component データ取得ヘルパ。
 *
 * 取得方針：
 * - 公開（is_published=true）かつ論理未削除（deleted_at IS NULL）のみ
 * - URL query 経由のフィルタ：カテゴリ複数（IN）/ 無料 or 有料 / キーワード（title or description ILIKE）
 * - 並び替え：display_order ASC（既定）
 * - 個人別情報を含めない（公開情報のみ）
 */

export type CoursesListFilters = {
  /** カテゴリ ID（複数可）。空なら絞り込まない。 */
  categoryIds?: string[]
  /** 'all' | 'free' | 'paid'（既定 'all'）。 */
  freeFilter?: 'all' | 'free' | 'paid'
  /** キーワード（title / description を ILIKE 検索）。 */
  keyword?: string
}

export type CourseListItem = {
  id: string
  slug: string
  title: string
  description: string | null
  thumbnail_url: string | null
  is_free: boolean
  price: number | null
  category_id: string
  category_name: string | null
  /** 注目コース（B001 LP の CourseShowcase / B002 のバッジ表示用）。 */
  is_featured: boolean
}

export async function getCoursesList(
  filters: CoursesListFilters = {},
): Promise<CourseListItem[]> {
  const supabase = await createClient()

  let query = supabase
    .from('e_learning_courses')
    .select(
      'id, slug, title, description, thumbnail_url, is_free, price, is_featured, category_id, category:e_learning_categories(name)',
    )
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('display_order', { ascending: true })

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    query = query.in('category_id', filters.categoryIds)
  }

  if (filters.freeFilter === 'free') {
    query = query.eq('is_free', true)
  } else if (filters.freeFilter === 'paid') {
    query = query.eq('is_free', false)
  }

  if (filters.keyword && filters.keyword.trim() !== '') {
    const kw = filters.keyword.trim().replace(/[%_]/g, '\\$&')
    query = query.or(`title.ilike.%${kw}%,description.ilike.%${kw}%`)
  }

  const { data, error } = await query
  if (error) {
    console.error('[b002] getCoursesList failed', { code: error.code })
    return []
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string
    slug: string
    title: string
    description: string | null
    thumbnail_url: string | null
    is_free: boolean
    price: number | null
    is_featured: boolean
    category_id: string
    /** Supabase relationship は to-one でも配列で返るケースがある。 */
    category: { name: string | null } | { name: string | null }[] | null
  }>

  return rows.map(r => {
    const cat = Array.isArray(r.category) ? r.category[0] : r.category
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      thumbnail_url: r.thumbnail_url,
      is_free: r.is_free,
      price: r.price,
      is_featured: r.is_featured,
      category_id: r.category_id,
      category_name: cat?.name ?? null,
    }
  })
}

export type ListCategory = {
  id: string
  name: string
  slug: string
}

/**
 * 一覧画面のフィルタチップ用カテゴリ取得（is_active=true・deleted_at IS NULL）。
 */
export async function getActiveCategories(): Promise<ListCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('e_learning_categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[b002] getActiveCategories failed', { code: error.code })
    return []
  }
  return (data ?? []) as ListCategory[]
}
