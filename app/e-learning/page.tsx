import { createStaticClient } from '@/app/lib/supabase/static'
import { createClient } from '@/app/lib/supabase/server'
import MainLayout from '@/app/components/MainLayout'
import ELearningClient from './ELearningClient'
import { ELearningContent } from '@/app/types'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'eラーニング - AI駆動研究所',
  description: 'AI駆動研究所のeラーニングコンテンツ。バイブコーディングやAI駆動開発の解説動画で、実践的なスキルを身につけましょう。',
  openGraph: {
    title: 'eラーニング - AI駆動研究所',
    description: 'AI駆動研究所のeラーニングコンテンツ。バイブコーディングやAI駆動開発の解説動画で、実践的なスキルを身につけましょう。',
  },
}

export const revalidate = 60 // 1分ごとに再検証

async function getELearningContents(): Promise<ELearningContent[]> {
  const supabase = createStaticClient()

  const { data: contents, error } = await supabase
    .from('e_learning_contents')
    .select(`
      *,
      category:e_learning_categories(id, name, slug),
      materials:e_learning_materials(id, title, file_url)
    `)
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching e-learning contents:', error)
    return []
  }

  return contents || []
}

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export default async function ELearningPage() {
  const contents = await getELearningContents()
  const user = await getCurrentUser()

  return (
    <MainLayout hideRightSidebar={true}>
      <div className="w-full">
        <ELearningClient contents={contents} isLoggedIn={!!user} />
      </div>
    </MainLayout>
  )
}
