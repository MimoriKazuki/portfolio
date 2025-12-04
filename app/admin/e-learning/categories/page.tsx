import { createClient } from '@/app/lib/supabase/server'
import CategoriesAdminClient from './CategoriesAdminClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminELearningCategoriesPage() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('e_learning_categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
  }

  return <CategoriesAdminClient categories={categories || []} />
}
