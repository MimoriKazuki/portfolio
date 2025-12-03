import { createClient } from '@/app/lib/supabase/server'
import ELearningForm from '../ELearningForm'

export const dynamic = 'force-dynamic'

export default async function NewELearningPage() {
  const supabase = await createClient()

  // カテゴリ一覧を取得（将来用）
  const { data: categories } = await supabase
    .from('e_learning_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">eラーニング新規作成</h1>
      <ELearningForm categories={categories || []} />
    </div>
  )
}
