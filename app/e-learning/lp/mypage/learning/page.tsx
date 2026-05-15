import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { MediaCard } from '@/app/components/molecules/MediaCard'
import { MediaGrid } from '@/app/components/organisms/MediaGrid'
import { MyPageTemplate } from '@/app/components/templates/MyPageTemplate'
import { MyPageSidebarClient } from '@/app/e-learning/lp/mypage/_lib/MyPageSidebarClient'
import { MyLearningFilterBar } from './_lib/MyLearningFilterBar'
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
 * - Kosuke FB 2026-05-15（追加）：左サイドバー型フィルタ → 上部ドロップダウン形式（Udemy 風）に変更
 *
 * 構成：
 * - 上部：タブ切替「購入済み」「ブックマーク済み」（既定：購入済み）
 * - その下：種別 / カテゴリ の単一選択ドロップダウン横並び
 * - 下：MediaGrid + MediaCard 全幅（B002 と同じ視覚）
 *
 * URL query（単一値）：
 * - tab=purchased|bookmarked（既定 purchased → 省略）
 * - type=course|content（既定 all → 省略）
 * - category={categoryId}（既定 all → 省略）
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

  const typeParam = get('type')
  const type = typeParam === 'course' || typeParam === 'content' ? typeParam : undefined

  const categoryParam = get('category')
  const categoryId = categoryParam && categoryParam.length > 0 ? categoryParam : undefined

  return { tab, type, categoryId }
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
        <MyLearningFilterBar
          categories={categories.map(c => ({ id: c.id, name: c.name }))}
        />
        <MediaGrid
          cols={3}
          isEmpty={items.length === 0}
          gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
      </div>
    </MyPageTemplate>
  )
}
