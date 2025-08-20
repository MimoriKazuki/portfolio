import { createClient } from '@/app/lib/supabase/server'
import { notFound } from 'next/navigation'
import ColumnForm from '../../ColumnForm'

export default async function EditColumnPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: column, error } = await supabase
    .from('columns')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !column) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">コラムを編集</h1>
      
      <div className="bg-youtube-gray rounded-lg">
        <ColumnForm initialData={column} columnId={params.id} />
      </div>
    </div>
  )
}