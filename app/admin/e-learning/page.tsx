import { createClient } from '@/app/lib/supabase/server'
import ELearningAdminClient from './ELearningAdminClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminELearningPage() {
  const supabase = await createClient()

  const [contentsResult, settingsResult] = await Promise.all([
    supabase
      .from('e_learning_contents')
      .select(`
        *,
        category:e_learning_categories(id, name, slug),
        materials:e_learning_materials(id, title, file_url)
      `)
      .order('created_at', { ascending: false }),
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'e_learning_released')
      .single()
  ])

  if (contentsResult.error) {
    console.error('Error fetching e-learning contents:', contentsResult.error)
  }

  const isReleased = settingsResult.data?.value === true

  return (
    <ELearningAdminClient
      contents={contentsResult.data || []}
      isReleased={isReleased}
    />
  )
}
