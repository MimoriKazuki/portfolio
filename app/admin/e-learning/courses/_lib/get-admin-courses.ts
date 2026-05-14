import { createClient } from '@/app/lib/supabase/server'

/**
 * C005 管理画面コース一覧：Server Component 用データ取得ヘルパ。
 *
 * 設計：
 * - 管理者ビュー：公開／非公開／論理削除済 を切り替えて表示できる
 *   - status='published'：is_published=true AND deleted_at IS NULL
 *   - status='draft'    ：is_published=false AND deleted_at IS NULL
 *   - status='deleted'  ：deleted_at IS NOT NULL
 *   - status='all'      ：全件
 * - キーワード：title ILIKE
 * - カテゴリ：category_id IN
 */

export type AdminCoursesFilters = {
  status?: 'published' | 'draft' | 'deleted' | 'all'
  categoryIds?: string[]
  keyword?: string
}

export type AdminCourseRow = {
  id: string
  slug: string
  title: string
  category_id: string
  category_name: string | null
  is_free: boolean
  price: number | null
  is_published: boolean
  is_featured: boolean
  stripe_price_id: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export async function getAdminCourses(filters: AdminCoursesFilters = {}): Promise<AdminCourseRow[]> {
  const supabase = await createClient()

  let query = supabase
    .from('e_learning_courses')
    .select(
      `id, slug, title, category_id, is_free, price, is_published, is_featured, stripe_price_id,
       deleted_at, created_at, updated_at,
       category:e_learning_categories(name)`,
    )
    .order('updated_at', { ascending: false })

  const status = filters.status ?? 'published'
  if (status === 'published') {
    query = query.eq('is_published', true).is('deleted_at', null)
  } else if (status === 'draft') {
    query = query.eq('is_published', false).is('deleted_at', null)
  } else if (status === 'deleted') {
    query = query.not('deleted_at', 'is', null)
  }
  // status === 'all' は何もしない

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    query = query.in('category_id', filters.categoryIds)
  }

  if (filters.keyword && filters.keyword.trim() !== '') {
    const kw = filters.keyword.trim().replace(/[%_]/g, '\\$&')
    query = query.ilike('title', `%${kw}%`)
  }

  const { data, error } = await query
  if (error) {
    console.error('[c005] getAdminCourses failed', { code: error.code })
    return []
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string
    slug: string
    title: string
    category_id: string
    is_free: boolean
    price: number | null
    is_published: boolean
    is_featured: boolean
    stripe_price_id: string | null
    deleted_at: string | null
    created_at: string
    updated_at: string
    category: { name: string | null } | { name: string | null }[] | null
  }>

  return rows.map(r => {
    const cat = Array.isArray(r.category) ? r.category[0] : r.category
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      category_id: r.category_id,
      category_name: cat?.name ?? null,
      is_free: r.is_free,
      price: r.price,
      is_published: r.is_published,
      is_featured: r.is_featured,
      stripe_price_id: r.stripe_price_id,
      deleted_at: r.deleted_at,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }
  })
}

export type AdminCategoryOption = {
  id: string
  name: string
}

export async function getAdminCategories(): Promise<AdminCategoryOption[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('e_learning_categories')
    .select('id, name')
    .is('deleted_at', null)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[c005] getAdminCategories failed', { code: error.code })
    return []
  }
  return (data ?? []) as AdminCategoryOption[]
}
