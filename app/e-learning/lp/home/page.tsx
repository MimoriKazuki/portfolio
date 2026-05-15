import { MediaCard } from '@/app/components/molecules/MediaCard'
import { MediaGrid } from '@/app/components/organisms/MediaGrid'
import { MixedListFilterClient } from './_lib/MixedListFilterClient'
import {
  getActiveCategoriesForHome,
  getMixedList,
  type MixedListFilters,
} from './_lib/get-mixed-list'

/**
 * B002 統合一覧（/e-learning/lp/home）— Server Component
 *
 * 起点：
 * - team-lead 指示「Claude Code Academy 風の左フィルタ + 3 列カードグリッド」
 * - screens.md B002（コース + 単体動画 混在一覧）
 *
 * 構成：
 * - 左カラム：MediaFilterSidebar（種別 / カテゴリ / 価格）+ 検索バー
 * - 右カラム：MediaGrid + MediaCard（type='course' or 'content'）
 *
 * URL query 同期：
 * - types=course,content / categories=...,... / price=free|paid / q=...
 *
 * 認証：middleware の startsWith('/e-learning/') ガード対象（screens.md B002 認証必要に整合）
 *
 * 既存 /lp/courses /lp/videos は touch せず温存（B003 / B006 として screens.md 通り）。
 */

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseFilters(
  sp: Record<string, string | string[] | undefined>,
): MixedListFilters {
  const get = (key: string): string | undefined => {
    const v = sp[key]
    return Array.isArray(v) ? v[0] : v
  }

  const typesParam = get('types')
  const types = typesParam
    ? typesParam
        .split(',')
        .filter(v => v === 'course' || v === 'content') as ('course' | 'content')[]
    : undefined

  const categoriesParam = get('categories')
  const categoryIds = categoriesParam
    ? categoriesParam.split(',').filter(Boolean)
    : undefined

  const priceParam = get('price')
  const priceFilter: MixedListFilters['priceFilter'] =
    priceParam === 'free' || priceParam === 'paid' ? priceParam : 'all'

  const keyword = get('q')

  return { types, categoryIds, priceFilter, keyword }
}

export default async function ELearningLPHomePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const filters = parseFilters(sp)

  const [items, categories] = await Promise.all([
    getMixedList(filters),
    getActiveCategoriesForHome(),
  ])

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 md:py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl text-foreground md:text-3xl">学びを探す</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          コース / 単体動画を横断的に検索できます。
        </p>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* 左カラム：フィルタ（aside landmark は内部 MediaFilterSidebar のみが担う・design-mate 指摘で div に変更） */}
        <div className="w-full shrink-0 lg:w-64">
          <MixedListFilterClient categories={categories.map(c => ({ id: c.id, name: c.name }))} />
        </div>

        {/* 右カラム：グリッド */}
        <section className="flex-1">
          <MediaGrid isEmpty={items.length === 0}>
            {items.map(item => (
              <MediaCard
                key={item.key}
                type={item.type}
                href={
                  item.type === 'course' && item.slug
                    ? `/e-learning/lp/courses/${item.slug}`
                    : `/e-learning/${item.id}`
                }
                title={item.title}
                thumbnailUrl={item.thumbnail_url}
                description={item.description}
                isFree={item.is_free}
                price={item.price}
                isFeatured={item.is_featured}
                categoryName={item.category_name}
                duration={item.type === 'content' ? item.duration : undefined}
              />
            ))}
          </MediaGrid>
        </section>
      </div>
    </main>
  )
}
