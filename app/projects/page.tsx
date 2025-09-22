import MainLayout from '@/app/components/MainLayout'
import ProjectsClient from './ProjectsClient'
import { createStaticClient } from '@/app/lib/supabase/static'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI制作物 - LandBridge株式会社',
  description: 'AIを活用したホームページ、LP、Webアプリ、モバイルアプリの制作実績。ChatGPT、Claude等の生成AIとNext.js、TypeScriptを組み合わせた高品質な制作事例をご覧ください。',
}

export const revalidate = 60 // ISR: 60秒ごとに再生成

async function getProjects() {
  const supabase = createStaticClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
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