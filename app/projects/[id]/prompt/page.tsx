import { notFound } from 'next/navigation'
import { createStaticClient } from '@/app/lib/supabase/static'
import PromptRequestClient from './PromptRequestClient'
import type { Metadata } from 'next'

export const revalidate = 60 // ISR: 60秒ごとに再生成
export const dynamicParams = true // 動的パラメータを許可
export const fetchCache = 'force-no-store' // キャッシュを無効化

// プロジェクトデータを取得
async function getProject(id: string) {
  const supabase = createStaticClient()
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  
  return project
}

// メタデータを生成
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params
  const project = await getProject(resolvedParams.id)
  
  if (!project) {
    return {
      title: 'LandBridge Media',
      description: 'LandBridge株式会社の開発実績をご紹介。',
    }
  }
    
  const metadata: Metadata = {
    title: `${project.title}のプロンプト - LandBridge Media`,
    description: `${project.title}の開発で使用したプロンプトをダウンロードできます。`,
    robots: {
      index: false,
      follow: false,
    },
  }

  return metadata
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PromptRequestPage({ params }: PageProps) {
  const resolvedParams = await params
  const project = await getProject(resolvedParams.id)

  if (!project || !project.prompt) {
    notFound()
  }

  return <PromptRequestClient projectId={resolvedParams.id} initialProject={project} />
}