import { createClient } from '@/app/lib/supabase/server'
import { notFound } from 'next/navigation'
import ELearningForm from '../../ELearningForm'

export const dynamic = 'force-dynamic'

interface EditELearningPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditELearningPage({ params }: EditELearningPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // コンテンツ取得
  const { data: content, error } = await supabase
    .from('e_learning_contents')
    .select(`
      *,
      materials:e_learning_materials(id, title, file_url, file_size, display_order)
    `)
    .eq('id', id)
    .single()

  if (error || !content) {
    notFound()
  }

  // カテゴリ一覧を取得（将来用）
  const { data: categories } = await supabase
    .from('e_learning_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">eラーニング編集</h1>
      <ELearningForm
        initialData={{
          title: content.title,
          description: content.description || '',
          thumbnail_url: content.thumbnail_url || '',
          video_url: content.video_url,
          category_id: content.category_id || '',
          is_free: content.is_free,
          is_published: content.is_published,
          is_featured: content.is_featured,
        }}
        initialMaterials={content.materials || []}
        contentId={id}
        categories={categories || []}
      />
    </div>
  )
}
