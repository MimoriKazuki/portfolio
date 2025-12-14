import { createStaticClient } from '@/app/lib/supabase/static'
import { createClient } from '@/app/lib/supabase/server'
import MainLayout from '@/app/components/MainLayout'
import ELearningTopClient from './ELearningTopClient'
import { ELearningContent, ELearningCategory } from '@/app/types'
import { Metadata } from 'next'

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

async function getUserPaidAccess(userId: string) {
  const supabase = await createClient()
  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('has_paid_access')
    .eq('auth_user_id', userId)
    .maybeSingle()

  return eLearningUser?.has_paid_access ?? false
}

async function updateLastAccessedAt(userId: string) {
  const supabase = await createClient()
  await supabase
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

  // ログインユーザーのブックマークと購入状態を取得
  const userBookmarks = user ? await getUserBookmarks(user.id) : []
  const hasPaidAccess = user ? await getUserPaidAccess(user.id) : false

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
          hasPaidAccess={hasPaidAccess}
        />
      </div>
    </MainLayout>
  )
}
