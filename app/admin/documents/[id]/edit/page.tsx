import { createClient } from '@/app/lib/supabase/server'
import { notFound } from 'next/navigation'
import DocumentForm from '../../DocumentForm'

export default async function EditDocumentPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !document) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">資料を編集</h1>
      
      <div className="bg-youtube-gray rounded-lg">
        <DocumentForm initialData={document} documentId={params.id} />
      </div>
    </div>
  )
}