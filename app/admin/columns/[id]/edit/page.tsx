import { createClient } from '@/app/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditColumnClient from './EditColumnClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditColumnPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: column, error } = await supabase
    .from('columns')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !column) {
    notFound()
  }

  return <EditColumnClient column={column} columnId={id} />
}