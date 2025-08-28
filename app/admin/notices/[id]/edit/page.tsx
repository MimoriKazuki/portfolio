import { notFound } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import NoticeForm from '../../NoticeForm'
import type { Notice } from '@/app/types'

interface EditNoticePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditNoticePage({ params }: EditNoticePageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: notice, error } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .single<Notice>()

  if (error || !notice) {
    notFound()
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">お知らせ編集</h1>
      <NoticeForm initialData={notice} noticeId={notice.id} />
    </div>
  )
}