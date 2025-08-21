import { createClient } from '@/app/lib/supabase/server'
import DocumentsClient from './DocumentsClient'

export const revalidate = 30 // 30秒ごとに再検証

export default async function DocumentsPage() {
  const supabase = await createClient()
  
  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
  }

  return <DocumentsClient documents={documents || []} />
}