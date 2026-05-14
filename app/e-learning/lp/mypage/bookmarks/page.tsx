import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { Button } from '@/app/components/atoms/Button'
import { EmptyState } from '@/app/components/molecules/EmptyState'
import { MyPageTemplate } from '@/app/components/templates/MyPageTemplate'
import { MyPageSidebarClient } from '@/app/e-learning/lp/mypage/_lib/MyPageSidebarClient'
import { BookmarkRowClient } from './_lib/BookmarkRowClient'
import { getMyBookmarksDetail } from './_lib/get-bookmarks-detail'

/**
 * B012 マイページ：ブックマーク（/e-learning/lp/mypage/bookmarks）— Server Component
 *
 * 起点：
 * - docs/frontend/screens.md B012
 * - docs/backend/logic/services/auxiliary-services.md §bookmark-service
 *
 * 設計：
 * - bookmark-service.list(userId, 'all') 経由でコース・単体動画混在のブックマーク取得
 * - 各行は Client Component（BookmarkRowClient）で「解除」ボタン + Server Action 連携
 * - M4 確定通り：コース内動画はブックマーク対象外（list 結果には含まれない）
 *
 * 個人別情報のため認証必須・未ログインは A001 へリダイレクト
 */

export const dynamic = 'force-dynamic'

export default async function ELearningLPMyBookmarksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?returnTo=/e-learning/lp/mypage/bookmarks')
  }

  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const bookmarks = eLearningUser ? await getMyBookmarksDetail(eLearningUser.id) : []

  return (
    <MyPageTemplate
      header={
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-foreground md:text-3xl">ブックマーク</h1>
          <p className="text-sm text-muted-foreground">
            あとで視聴したいコース・単体動画を保存できます。
          </p>
        </header>
      }
      sidebar={<MyPageSidebarClient />}
    >
      {bookmarks.length === 0 ? (
        <EmptyState
          title="ブックマークはまだありません"
          description="コース・単体動画の詳細ページでブックマークアイコンをタップして保存できます。"
          action={
            <Button asChild>
              <Link href="/e-learning/lp/courses">コース一覧へ</Link>
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card text-card-foreground">
          {bookmarks.map(b => (
            <BookmarkRowClient key={b.id} bookmark={b} />
          ))}
        </ul>
      )}
    </MyPageTemplate>
  )
}
