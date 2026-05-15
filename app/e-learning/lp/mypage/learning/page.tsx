import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { MediaCard } from '@/app/components/molecules/MediaCard'
import { MediaGrid } from '@/app/components/organisms/MediaGrid'
import { MyPageTemplate } from '@/app/components/templates/MyPageTemplate'
import { MyPageSidebarClient } from '@/app/e-learning/lp/mypage/_lib/MyPageSidebarClient'
import { MyLearningFilterClient } from './_lib/MyLearningFilterClient'
import { MyLearningTabsClient } from './_lib/MyLearningTabsClient'
import {
  getActiveCategoriesForMyLearning,
  getMyLearning,
  type MyLearningFilters,
  type MyLearningTab,
} from './_lib/get-my-learning'

/**
 * マイラーニング（/e-learning/lp/mypage/learning）— Server Component
 *
 * 起点：
 * - Kosuke FB 2026-05-15：マイページの「購入履歴 / ブックマーク / 視聴履歴」3 メニューを
 *   「マイラーニング（購入 + ブックマーク 統合）/ 購入履歴 / プロフィール」に再編
 *
 * 構成：
 * - 上部：タブ切替「購入済み」「ブックマーク済み」（既定：購入済み）
 * - 左カラム：種別 + カテゴリ フィルタ（価格フィルタは出さない・全件アクセス可のため）
 * - 右カラム：MediaGrid + MediaCard（B002 と同じ視覚）
 *
 * URL query：
 * - tab=purchased|bookmarked（既定 purchased → 省略）
 * - types=course,content
 * - categories=id,id
 *
 * 認証：個人別情報のため未ログインは A001 へリダイレクト
 */

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseFilters(sp: Record<string, string | string[] | undefined>): MyLearningFilters {
  const get = (key: string): string | undefined => {
    const v = sp[key]
    return Array.isArray(v) ? v[0] : v
  }

  const tabParam = get('tab')
  const tab: MyLearningTab = tabParam === 'bookmarked' ? 'bookmarked' : 'purchased'

  const typesParam = get('types')
  const types = typesParam
    ? (typesParam.split(',').filter(v => v === 'course' || v === 'content') as ('course' | 'content')[])
    : undefined

  const categoriesParam = get('categories')
  const categoryIds = categoriesParam ? categoriesParam.split(',').filter(Boolean) : undefined

  return { tab, types, categoryIds }
}

export default async function ELearningLPMyLearningPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?returnTo=/e-learning/lp/mypage/learning')
  }

  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const sp = await searchParams
  const filters = parseFilters(sp)

  const [items, categories] = await Promise.all([
    eLearningUser
      ? getMyLearning(eLearningUser.id, filters)
      : Promise.resolve([]),
    getActiveCategoriesForMyLearning(),
  ])

  return (
    <MyPageTemplate
      header={
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-foreground md:text-3xl">マイラーニング</h1>
          <p className="text-sm text-muted-foreground">
            購入したコース・単体動画と、ブックマーク済みの一覧を切り替えて確認できます。
          </p>
        </header>
      }
      sidebar={<MyPageSidebarClient />}
    >
      <div className="flex flex-col gap-6">
        <MyLearningTabsClient activeTab={filters.tab} />

        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          <div className="w-full shrink-0 md:w-56">
            <MyLearningFilterClient
              categories={categories.map(c => ({ id: c.id, name: c.name }))}
            />
          </div>

          <section className="flex-1">
            <MediaGrid
              cols={3}
              isEmpty={items.length === 0}
              gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
            >
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
                  categoryName={item.category_name}
                />
              ))}
            </MediaGrid>
          </section>
        </div>
      </div>
    </MyPageTemplate>
  )
}
