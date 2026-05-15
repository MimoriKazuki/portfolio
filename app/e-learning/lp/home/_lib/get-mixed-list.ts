import { createClient } from '@/app/lib/supabase/server'

/**
 * B002 統合一覧（/e-learning/lp/home）用の Server Component データ取得ヘルパ。
 *
 * 取得方針：
 * - 公開（is_published=true）かつ論理未削除（deleted_at IS NULL）のみ
 * - e_learning_courses + e_learning_contents を別々に取得し JS 側で結合
 *   （Supabase は UNION ALL 不可・to-one JOIN もテーブル別に SELECT する必要あり）
 * - 各レコードに type='course' / type='content' を付与
 * - is_featured 降順 → created_at 降順でソート
 * - フィルタ：種別 / カテゴリ / 価格 / キーワード（title / description ILIKE）
 *
 * 注意：
 * - course / content の章数・動画数は B002 では表示しない設計（パフォーマンス上の判断）
 * - クライアント側でカード描画する MediaCard は chapterCount/videoCount/duration を任意 props として受ける
 */

export type MediaListItem = {
  /** "course:{course_id}" or "content:{content_id}" 形式の安定 key。 */
  key: string
  type: 'course' | 'content'
  id: string
  slug: string | null
  title: string
  description: string | null
  thumbnail_url: string | null
  is_free: boolean
  price: number | null
  is_featured: boolean
  category_id: string | null
  category_name: string | null
  /** content のみ：再生時間（"12:34" 等）。 */
  duration: string | null
  /** ソート用：is_featured が true なら 1、false なら 0。 */
  _featuredScore: number
  /** ソート用：created_at の epoch ms。 */
  _createdMs: number
}

export type MixedListFilters = {
  /** 種別フィルタ。空配列なら絞り込まない（= 両方表示）。 */
  types?: ('course' | 'content')[]
  /** カテゴリ ID（複数可）。 */
  categoryIds?: string[]
  /** 価格フィルタ。 */
  priceFilter?: 'all' | 'free' | 'paid'
  /** キーワード。title / description を ILIKE 検索。 */
  keyword?: string
}

const escapeIlike = (s: string) => s.replace(/[%_]/g, '\\$&')

export async function getMixedList(
  filters: MixedListFilters = {},
): Promise<MediaListItem[]> {
  const supabase = await createClient()
  const types = filters.types?.length
    ? filters.types
    : (['course', 'content'] as const)

  const fetchCourses = async (): Promise<MediaListItem[]> => {
    if (!types.includes('course')) return []
    let q = supabase
      .from('e_learning_courses')
      .select(
        'id, slug, title, description, thumbnail_url, is_free, price, is_featured, category_id, created_at, category:e_learning_categories(name)',
      )
      .eq('is_published', true)
      .is('deleted_at', null)

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      q = q.in('category_id', filters.categoryIds)
    }
    if (filters.priceFilter === 'free') q = q.eq('is_free', true)
    else if (filters.priceFilter === 'paid') q = q.eq('is_free', false)
    if (filters.keyword && filters.keyword.trim() !== '') {
      const kw = escapeIlike(filters.keyword.trim())
      q = q.or(`title.ilike.%${kw}%,description.ilike.%${kw}%`)
    }

    const { data, error } = await q
    if (error) {
      console.error('[b002] courses fetch failed', { code: error.code })
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
      category_id: string | null
      created_at: string
      category: { name: string | null } | { name: string | null }[] | null
    }>
    return rows.map(r => {
      const cat = Array.isArray(r.category) ? r.category[0] : r.category
      return {
        key: `course:${r.id}`,
        type: 'course' as const,
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
        duration: null,
        _featuredScore: r.is_featured ? 1 : 0,
        _createdMs: new Date(r.created_at).getTime(),
      }
    })
  }

  const fetchContents = async (): Promise<MediaListItem[]> => {
    if (!types.includes('content')) return []
    let q = supabase
      .from('e_learning_contents')
      .select(
        'id, title, description, thumbnail_url, is_free, price, is_featured, duration, category_id, created_at, category:e_learning_categories(name)',
      )
      .eq('is_published', true)
      .is('deleted_at', null)

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      q = q.in('category_id', filters.categoryIds)
    }
    if (filters.priceFilter === 'free') q = q.eq('is_free', true)
    else if (filters.priceFilter === 'paid') q = q.eq('is_free', false)
    if (filters.keyword && filters.keyword.trim() !== '') {
      const kw = escapeIlike(filters.keyword.trim())
      q = q.or(`title.ilike.%${kw}%,description.ilike.%${kw}%`)
    }

    const { data, error } = await q
    if (error) {
      console.error('[b002] contents fetch failed', { code: error.code })
      return []
    }
    const rows = (data ?? []) as unknown as Array<{
      id: string
      title: string
      description: string | null
      thumbnail_url: string | null
      is_free: boolean | null
      price: number | null
      is_featured: boolean | null
      duration: string | null
      category_id: string | null
      created_at: string
      category: { name: string | null } | { name: string | null }[] | null
    }>
    return rows.map(r => {
      const cat = Array.isArray(r.category) ? r.category[0] : r.category
      return {
        key: `content:${r.id}`,
        type: 'content' as const,
        id: r.id,
        slug: null,
        title: r.title,
        description: r.description,
        thumbnail_url: r.thumbnail_url,
        is_free: !!r.is_free,
        price: r.price,
        is_featured: !!r.is_featured,
        category_id: r.category_id,
        category_name: cat?.name ?? null,
        duration: r.duration,
        _featuredScore: r.is_featured ? 1 : 0,
        _createdMs: new Date(r.created_at).getTime(),
      }
    })
  }

  const [courses, contents] = await Promise.all([fetchCourses(), fetchContents()])

  // 結合 + is_featured 降順 → created_at 降順
  return [...courses, ...contents].sort((a, b) => {
    if (a._featuredScore !== b._featuredScore) return b._featuredScore - a._featuredScore
    return b._createdMs - a._createdMs
  })
}

export type ActiveCategory = {
  id: string
  name: string
  slug: string
}

export async function getActiveCategoriesForHome(): Promise<ActiveCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('e_learning_categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[b002] categories fetch failed', { code: error.code })
    return []
  }
  return (data ?? []) as ActiveCategory[]
}
