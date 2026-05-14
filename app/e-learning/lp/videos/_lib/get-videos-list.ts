import { createClient } from '@/app/lib/supabase/server'

/**
 * B003 単体動画一覧（/e-learning/lp/videos）用の Server Component データ取得ヘルパ。
 *
 * 取得方針：
 * - 公開（is_published=true）かつ論理未削除（deleted_at IS NULL）のみ
 * - URL query 経由のフィルタ：カテゴリ複数（IN）/ 無料 or 有料 / キーワード（title / description ILIKE）
 * - 並び替え：display_order ASC（既定）
 * - 個人別情報は含めない（公開情報のみ）
 */

export type VideosListFilters = {
  categoryIds?: string[]
  freeFilter?: 'all' | 'free' | 'paid'
  keyword?: string
}

export type VideoListItem = {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  duration: string | null
  is_free: boolean
  price: number | null
  category_id: string | null
  category_name: string | null
}

export async function getVideosList(
  filters: VideosListFilters = {},
): Promise<VideoListItem[]> {
  const supabase = await createClient()

  let query = supabase
    .from('e_learning_contents')
    .select(
      'id, title, description, thumbnail_url, duration, is_free, price, category_id, category:e_learning_categories(name)',
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
    console.error('[b003] getVideosList failed', { code: error.code })
    return []
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string
    title: string
    description: string | null
    thumbnail_url: string | null
    duration: string | null
    is_free: boolean
    price: number | null
    category_id: string | null
    /** Supabase relationship は to-one でも配列で返るケースがある。 */
    category: { name: string | null } | { name: string | null }[] | null
  }>

  return rows.map(r => {
    const cat = Array.isArray(r.category) ? r.category[0] : r.category
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      thumbnail_url: r.thumbnail_url,
      duration: r.duration,
      is_free: r.is_free,
      price: r.price,
      category_id: r.category_id,
      category_name: cat?.name ?? null,
    }
  })
}
