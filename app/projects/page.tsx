import MainLayout from '@/app/components/MainLayout'
import ProjectsClient from './ProjectsClient'
import { createStaticClient } from '@/app/lib/supabase/static'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '開発実績 - LandBridge Media',
  description: '企業サイト、LP、Webアプリ、モバイルアプリなど豊富な開発実績。最新のReact、Next.js、TypeScriptを活用した高品質な制作事例をご覧ください。',
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
      <div className="w-full">
        <ProjectsClient projects={projects} />
      </div>
    </MainLayout>
  )
}