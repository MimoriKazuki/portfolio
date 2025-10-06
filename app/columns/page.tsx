import { createClient } from '@/app/lib/supabase/server'
import MainLayout from '@/app/components/MainLayout'
import ColumnsClient from './ColumnsClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'コラム - LandBridge AI coaching',
  description: 'LandBridge AI coachingがお届けする生成AI活用の最新情報。ビジネス実例、最新ツール紹介、AIコーチングのノイなどをコラムで紹介。',
}

export const revalidate = 60

export default async function ColumnsPage() {
  const supabase = await createClient()
  
  const { data: columns, error } = await supabase
    .from('columns')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching columns:', error)
    return <div>コラムの取得中にエラーが発生しました</div>
  }

  return (
    <MainLayout>
      <div className="w-full">
        <ColumnsClient columns={columns || []} />
      </div>
    </MainLayout>
  )
}