import { createClient } from '@/app/lib/supabase/server'
import { notFound } from 'next/navigation'
import ColumnForm from '../../ColumnForm'

interface EditColumnPageProps {
  params: { id: string }
}

export default async function EditColumnPage({ params }: EditColumnPageProps) {
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">コラム編集</h1>
      <ColumnForm column={column} />
    </div>
  )
}