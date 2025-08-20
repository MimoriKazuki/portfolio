import { createClient } from '@/app/lib/supabase/server'
import ColumnsClient from './ColumnsClient'

export default async function ColumnsPage() {
  const supabase = await createClient()
  
  const { data: columns, error } = await supabase
    .from('columns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching columns:', error)
  }

  return <ColumnsClient columns={columns || []} />
}