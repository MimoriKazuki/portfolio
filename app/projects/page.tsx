import MainLayout from '@/app/components/MainLayout'
import ProjectsClient from './ProjectsClient'
import { createStaticClient } from '@/app/lib/supabase/static'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '開発実績一覧 | LandBridge株式会社',
  description: '企業サイト、LP、Webアプリ、モバイルアプリなど豊富な開発実績。最新のReact、Next.js、TypeScriptを活用した高品質な制作事例をご覧ください。',
  keywords: ['開発実績', 'ポートフォリオ', 'Webサイト制作', 'LP制作', 'システム開発', 'アプリ開発', 'React', 'Next.js', 'TypeScript'],
  openGraph: {
    title: '開発実績一覧 | LandBridge株式会社',
    description: '豊富な開発実績と最新技術で、お客様のビジネスを成功に導きます。制作事例をぜひご覧ください。',
    type: 'website',
    url: 'https://portfolio-site-blond-eta.vercel.app/projects',
  },
}

export const revalidate = 60 // ISR: 60秒ごとに再生成

async function getProjects() {
  const supabase = createStaticClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('order', { ascending: true })
  return projects || []
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <MainLayout>
      <ProjectsClient projects={projects} />
    </MainLayout>
  )
}