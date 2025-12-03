import { createClient } from '@/app/lib/supabase/server'
import ELearningAdminClient from './ELearningAdminClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminELearningPage() {
  const supabase = await createClient()

  const { data: contents, error } = await supabase
    .from('e_learning_contents')
    .select(`
      *,
      category:e_learning_categories(id, name, slug),
      materials:e_learning_materials(id, title, file_url)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching e-learning contents:', error)
  }

  return <ELearningAdminClient contents={contents || []} />
}
