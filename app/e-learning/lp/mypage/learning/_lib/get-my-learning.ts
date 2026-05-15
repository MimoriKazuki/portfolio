import { createClient } from '@/app/lib/supabase/server'
import { list as listBookmarks } from '@/app/lib/services/bookmark-service'

/**
 * マイラーニング（/e-learning/lp/mypage/learning）— Server Component 用データ取得ヘルパ。
 *
 * 取得方針：
 * - tab='purchased'：e_learning_purchases.status='completed' の course / content を MediaCard 表示用に整形
 *   refunded（返金済）は除外（マイラーニングは「現在見られるもの」を出す画面のため）
 * - tab='bookmarked'：bookmark-service.list(userId, 'all') から取得し、course / content の title 等を JOIN
 *   既存 B012 の get-bookmarks-detail と整合
 * - 公開済（is_published=true / deleted_at IS NULL）のみ：マイラーニングは視聴前提のため、非公開・削除済は出さない
 *   （B012 ブックマークは過去事実保持で全件出していたが、マイラーニングは「いま視聴できるもの」に揃える）
 * - フィルタ：種別（types: course/content）/ カテゴリ（categoryIds）は呼び出し側でクエリ層に渡し DB レベルで絞る
 */

export type MyLearningTab = 'purchased' | 'bookmarked'

export interface MyLearningFilters {
  tab: MyLearningTab
  types?: ('course' | 'content')[]
  categoryIds?: string[]
}

export interface MyLearningItem {
  /** React key 用：tab 内で一意（タブ切替で衝突しないよう prefix 付き） */
  key: string
  /** B002 と同じ MediaCard 用 */
  type: 'course' | 'content'
  /** course の場合 slug が必要・content の場合 null */
  slug: string | null
  /** detail へのリンク先 id（course の場合は course.id、content の場合は content.id） */
  id: string
  title: string
  thumbnail_url: string | null
  description: string | null
  category_name: string | null
  is_free: boolean
  price: number | null
  /** マイラーニングは購入済 or ブックマーク済 = 全て無料視聴可・MediaCard 表示用に渡すが意味的にはアクセス済の意 */
}

type CategoryRow = { id: string; name: string }

export async function getActiveCategoriesForMyLearning(): Promise<CategoryRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('e_learning_categories')
    .select('id, name')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  if (error) {
    console.error('[my-learning] categories fetch failed', { code: error.code })
    return []
  }
  return (data ?? []) as CategoryRow[]
}

/** 購入済（status='completed'）の course / content 一覧を MediaCard 表示形式で返す。 */
async function getPurchasedList(
  userId: string,
  filters: Omit<MyLearningFilters, 'tab'>,
): Promise<MyLearningItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('e_learning_purchases')
    .select(
      `id, course_id, content_id, status, created_at,
       course:e_learning_courses ( id, title, slug, thumbnail_url, description, is_published, deleted_at, category_id, is_free, price, category:e_learning_categories ( id, name ) ),
       content:e_learning_contents ( id, title, thumbnail_url, description, is_published, deleted_at, category_id, is_free, price, category:e_learning_categories ( id, name ) )`,
    )
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[my-learning] purchased fetch failed', { code: error.code })
    return []
  }

  type CategoryJoin = { id: string; name: string } | { id: string; name: string }[] | null
  type CourseJoin = {
    id: string
    title: string | null
    slug: string | null
    thumbnail_url: string | null
    description: string | null
    is_published: boolean | null
    deleted_at: string | null
    category_id: string | null
    is_free: boolean | null
    price: number | null
    category: CategoryJoin
  }
  type ContentJoin = {
    id: string
    title: string | null
    thumbnail_url: string | null
    description: string | null
    is_published: boolean | null
    deleted_at: string | null
    category_id: string | null
    is_free: boolean | null
    price: number | null
    category: CategoryJoin
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string
    course_id: string | null
    content_id: string | null
    course: CourseJoin | CourseJoin[] | null
    content: ContentJoin | ContentJoin[] | null
  }>

  const wantTypes = filters.types && filters.types.length > 0 ? new Set(filters.types) : null
  const wantCategoryIds =
    filters.categoryIds && filters.categoryIds.length > 0 ? new Set(filters.categoryIds) : null

  const items: MyLearningItem[] = []

  for (const r of rows) {
    const courseRaw = Array.isArray(r.course) ? r.course[0] : r.course
    const contentRaw = Array.isArray(r.content) ? r.content[0] : r.content

    if (r.course_id && courseRaw) {
      if (courseRaw.is_published === false || courseRaw.deleted_at !== null) continue
      if (wantTypes && !wantTypes.has('course')) continue
      if (wantCategoryIds && (!courseRaw.category_id || !wantCategoryIds.has(courseRaw.category_id))) continue
      const cat = Array.isArray(courseRaw.category) ? courseRaw.category[0] : courseRaw.category
      items.push({
        key: `course:${courseRaw.id}`,
        type: 'course',
        slug: courseRaw.slug,
        id: courseRaw.id,
        title: courseRaw.title ?? '',
        thumbnail_url: courseRaw.thumbnail_url,
        description: courseRaw.description,
        category_name: cat?.name ?? null,
        is_free: courseRaw.is_free === true,
        price: courseRaw.price,
      })
    } else if (r.content_id && contentRaw) {
      if (contentRaw.is_published === false || contentRaw.deleted_at !== null) continue
      if (wantTypes && !wantTypes.has('content')) continue
      if (wantCategoryIds && (!contentRaw.category_id || !wantCategoryIds.has(contentRaw.category_id))) continue
      const cat = Array.isArray(contentRaw.category) ? contentRaw.category[0] : contentRaw.category
      items.push({
        key: `content:${contentRaw.id}`,
        type: 'content',
        slug: null,
        id: contentRaw.id,
        title: contentRaw.title ?? '',
        thumbnail_url: contentRaw.thumbnail_url,
        description: contentRaw.description,
        category_name: cat?.name ?? null,
        is_free: contentRaw.is_free === true,
        price: contentRaw.price,
      })
    }
  }

  return items
}

/** ブックマーク済の course / content 一覧を MediaCard 表示形式で返す（公開済のみ）。 */
async function getBookmarkedList(
  userId: string,
  filters: Omit<MyLearningFilters, 'tab'>,
): Promise<MyLearningItem[]> {
  const records = await listBookmarks(userId, 'all').catch(err => {
    console.error('[my-learning] bookmarks list failed', {
      message: err instanceof Error ? err.message : String(err),
    })
    return [] as Awaited<ReturnType<typeof listBookmarks>>
  })
  if (records.length === 0) return []

  const courseIds = records.map(r => r.course_id).filter((v): v is string => !!v)
  const contentIds = records.map(r => r.content_id).filter((v): v is string => !!v)

  const supabase = await createClient()

  const [coursesResp, contentsResp] = await Promise.all([
    courseIds.length > 0
      ? supabase
          .from('e_learning_courses')
          .select(
            'id, title, slug, thumbnail_url, description, is_published, deleted_at, category_id, is_free, price, category:e_learning_categories ( id, name )',
          )
          .in('id', courseIds)
      : Promise.resolve({ data: [] as Array<Record<string, unknown>>, error: null }),
    contentIds.length > 0
      ? supabase
          .from('e_learning_contents')
          .select(
            'id, title, thumbnail_url, description, is_published, deleted_at, category_id, is_free, price, category:e_learning_categories ( id, name )',
          )
          .in('id', contentIds)
      : Promise.resolve({ data: [] as Array<Record<string, unknown>>, error: null }),
  ])

  if (coursesResp.error) console.error('[my-learning] courses fetch failed', { code: coursesResp.error.code })
  if (contentsResp.error) console.error('[my-learning] contents fetch failed', { code: contentsResp.error.code })

  type CategoryJoin = { id: string; name: string } | { id: string; name: string }[] | null
  type CourseDetail = {
    id: string
    title: string | null
    slug: string | null
    thumbnail_url: string | null
    description: string | null
    is_published: boolean | null
    deleted_at: string | null
    category_id: string | null
    is_free: boolean | null
    price: number | null
    category: CategoryJoin
  }
  type ContentDetail = {
    id: string
    title: string | null
    thumbnail_url: string | null
    description: string | null
    is_published: boolean | null
    deleted_at: string | null
    category_id: string | null
    is_free: boolean | null
    price: number | null
    category: CategoryJoin
  }

  const coursesMap = new Map<string, CourseDetail>(
    ((coursesResp.data ?? []) as unknown as CourseDetail[]).map(c => [c.id, c]),
  )
  const contentsMap = new Map<string, ContentDetail>(
    ((contentsResp.data ?? []) as unknown as ContentDetail[]).map(c => [c.id, c]),
  )

  const wantTypes = filters.types && filters.types.length > 0 ? new Set(filters.types) : null
  const wantCategoryIds =
    filters.categoryIds && filters.categoryIds.length > 0 ? new Set(filters.categoryIds) : null

  const items: MyLearningItem[] = []

  for (const r of records) {
    if (r.course_id) {
      const c = coursesMap.get(r.course_id)
      if (!c) continue
      if (c.is_published === false || c.deleted_at !== null) continue
      if (wantTypes && !wantTypes.has('course')) continue
      if (wantCategoryIds && (!c.category_id || !wantCategoryIds.has(c.category_id))) continue
      const cat = Array.isArray(c.category) ? c.category[0] : c.category
      items.push({
        key: `course:${c.id}`,
        type: 'course',
        slug: c.slug,
        id: c.id,
        title: c.title ?? '',
        thumbnail_url: c.thumbnail_url,
        description: c.description,
        category_name: cat?.name ?? null,
        is_free: c.is_free === true,
        price: c.price,
      })
    } else if (r.content_id) {
      const c = contentsMap.get(r.content_id)
      if (!c) continue
      if (c.is_published === false || c.deleted_at !== null) continue
      if (wantTypes && !wantTypes.has('content')) continue
      if (wantCategoryIds && (!c.category_id || !wantCategoryIds.has(c.category_id))) continue
      const cat = Array.isArray(c.category) ? c.category[0] : c.category
      items.push({
        key: `content:${c.id}`,
        type: 'content',
        slug: null,
        id: c.id,
        title: c.title ?? '',
        thumbnail_url: c.thumbnail_url,
        description: c.description,
        category_name: cat?.name ?? null,
        is_free: c.is_free === true,
        price: c.price,
      })
    }
  }

  return items
}

export async function getMyLearning(
  userId: string,
  filters: MyLearningFilters,
): Promise<MyLearningItem[]> {
  if (filters.tab === 'bookmarked') {
    return getBookmarkedList(userId, filters)
  }
  return getPurchasedList(userId, filters)
}
