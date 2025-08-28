import { createClient } from '@/app/lib/supabase/server'
import NoticesClient from './NoticesClient'
import type { Notice } from '@/app/types'

export default async function NoticesPage() {
  const supabase = await createClient()
  
  const { data: notices, error } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Notice[]>()

  if (error) {
    console.error('Error fetching notices:', error)
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          お知らせの取得中にエラーが発生しました
        </div>
      </div>
    )
  }

  return <NoticesClient notices={notices || []} />
}