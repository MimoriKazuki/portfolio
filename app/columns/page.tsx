import { createClient } from '@/app/lib/supabase/server'
import MainLayout from '@/app/components/MainLayout'
import ColumnsClient from './ColumnsClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'コラム - AI駆動研究所',
  description: 'AI駆動研究所がお届けする生成AI活用の最新情報。技術解説、ビジネス実例、最新AI動向、プロンプトエンジニアリングのノウハウなど、AI駆動時代を生き抜くための情報をお届けします。',
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