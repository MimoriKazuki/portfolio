import { createClient } from '@/app/lib/supabase/server'
import MainLayout from '@/app/components/MainLayout'
import NoticesClient from './NoticesClient'
import type { Notice } from '@/app/types'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お知らせ - LandBridge Media',
  description: 'LandBridge Media からの最新のお知らせ、ニュース、アップデート情報をご覧ください。',
}

export default async function NoticesPage() {
  const supabase = await createClient()
  
  const { data: notices, error } = await supabase
    .from('notices')
    .select('*')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .returns<Notice[]>()

  if (error) {
    console.error('Error fetching notices:', error)
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            お知らせの取得中にエラーが発生しました
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <NoticesClient notices={notices || []} />
    </MainLayout>
  )
}