import { createStaticClient } from '@/app/lib/supabase/static'
import { createClient } from '@/app/lib/supabase/server'
import { createClient as createServerClient } from '@supabase/supabase-js'
import MainLayout from '@/app/components/MainLayout'
import ELearningTopClient from './ELearningTopClient'
import { ELearningContent, ELearningCategory } from '@/app/types'
import { Metadata } from 'next'
import { getViewerAccess } from '@/app/lib/services/access-service'

export const metadata: Metadata = {
  title: 'eラーニング - AI駆動研究所',
  description: 'AI駆動研究所のeラーニングコンテンツ。バイブコーディングやAI駆動開発の解説動画で、実践的なスキルを身につけましょう。',
  openGraph: {
    title: 'eラーニング - AI駆動研究所',
    description: 'AI駆動研究所のeラーニングコンテンツ。バイブコーディングやAI駆動開発の解説動画で、実践的なスキルを身につけましょう。',
  },
}

// ユーザー認証状態に依存するため動的レンダリング
export const dynamic = 'force-dynamic'

async function getCategories(): Promise<ELearningCategory[]> {
  const supabase = createStaticClient()

  const { data: categories, error } = await supabase
    .from('e_learning_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return categories || []
}

async function getFeaturedContents(): Promise<ELearningContent[]> {
  const supabase = createStaticClient()

  const { data: contents, error } = await supabase
    .from('e_learning_contents')
    .select(`
      *,
      category:e_learning_categories(id, name, slug)
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching featured contents:', error)
    return []
  }

  return contents || []
}

async function getContentsByCategory(categoryIds: string[]): Promise<Record<string, ELearningContent[]>> {
  const supabase = createStaticClient()
  const result: Record<string, ELearningContent[]> = {}

  for (const categoryId of categoryIds) {
    const { data: contents, error } = await supabase
      .from('e_learning_contents')
      .select(`
        *,
        category:e_learning_categories(id, name, slug)
      `)
      .eq('is_published', true)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })
      .limit(3)

    if (!error && contents) {
      result[categoryId] = contents
    }
  }

  return result
}

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { user, supabase }
}

async function getUserBookmarks(userId: string) {
  const supabase = await createClient()
  const { data: bookmarks, error } = await supabase
    .from('e_learning_bookmarks')
    .select('content_id')
    .eq('user_id', userId)

  console.log('[ELearning Page] Fetching bookmarks for user:', userId, 'result:', { bookmarks, error })
  return bookmarks?.map(b => b.content_id) || []
}

/**
 * 視聴一覧用：認証済ユーザーの全体アクセス権を取得。
 * 内部で auth_user_id → e_learning_users.id 解決 → access-service.getViewerAccess を呼ぶ。
 * has_paid_access への参照は削除済み（M5 安全順序：has_full_access のみ参照）。
 */
async function getUserFullAccess(authUserId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('id')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (!eLearningUser) return false

  const { hasFullAccess } = await getViewerAccess(eLearningUser.id)
  return hasFullAccess
}

async function updateLastAccessedAt(userId: string) {
  // RLSをバイパスしてアクセス日時を更新（service_role_key使用）
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  await supabaseAdmin
    .from('e_learning_users')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('auth_user_id', userId)
}

export default async function ELearningPage() {
  const [categories, featuredContents, { user }] = await Promise.all([
    getCategories(),
    getFeaturedContents(),
    getCurrentUser(),
  ])

  const categoryIds = categories.map(c => c.id)
  const contentsByCategory = await getContentsByCategory(categoryIds)

  // ログインユーザーのブックマークとアクセス権を取得
  // hasFullAccess は access-service 経由で取得（has_paid_access 直書きを廃止）
  const userBookmarks = user ? await getUserBookmarks(user.id) : []
  const hasFullAccess = user ? await getUserFullAccess(user.id) : false

  // 最終アクセス日時を更新（非同期で実行、エラーは無視）
  if (user) {
    updateLastAccessedAt(user.id).catch(() => {})
  }

  return (
    <MainLayout>
      <div className="w-full">
        <ELearningTopClient
          featuredContents={featuredContents}
          categories={categories}
          contentsByCategory={contentsByCategory}
          isLoggedIn={!!user}
          userBookmarks={userBookmarks}
          hasPaidAccess={hasFullAccess}
        />
      </div>
    </MainLayout>
  )
}
