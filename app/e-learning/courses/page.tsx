import { createStaticClient } from '@/app/lib/supabase/static'
import { createClient } from '@/app/lib/supabase/server'
import MainLayout from '@/app/components/MainLayout'
import ELearningCoursesClient from './ELearningCoursesClient'
import { ELearningContent, ELearningCategory } from '@/app/types'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'コース一覧 - eラーニング - AI駆動研究所',
  description: 'AI駆動研究所のeラーニングコース一覧。カテゴリ別に動画コンテンツを探せます。',
  openGraph: {
    title: 'コース一覧 - eラーニング - AI駆動研究所',
    description: 'AI駆動研究所のeラーニングコース一覧。カテゴリ別に動画コンテンツを探せます。',
  },
}

export const revalidate = 60

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

async function getContents(): Promise<ELearningContent[]> {
  const supabase = createStaticClient()

  const { data: contents, error } = await supabase
    .from('e_learning_contents')
    .select(`
      *,
      category:e_learning_categories(id, name, slug),
      materials:e_learning_materials(id, title, file_url)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching e-learning contents:', error)
    return []
  }

  return contents || []
}

async function getCurrentUserAndBookmarks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, bookmarks: [] }
  }

  const { data: bookmarks } = await supabase
    .from('e_learning_bookmarks')
    .select('content_id')
    .eq('user_id', user.id)

  return {
    user,
    bookmarks: bookmarks?.map(b => b.content_id) || [],
  }
}

export default async function ELearningCoursesPage() {
  const [categories, contents, { user, bookmarks }] = await Promise.all([
    getCategories(),
    getContents(),
    getCurrentUserAndBookmarks(),
  ])

  return (
    <MainLayout hideRightSidebar={true}>
      <div className="w-full">
        <ELearningCoursesClient
          contents={contents}
          categories={categories}
          isLoggedIn={!!user}
          userBookmarks={bookmarks}
        />
      </div>
    </MainLayout>
  )
}
