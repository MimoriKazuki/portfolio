import MainLayout from './components/MainLayout'
import HomeContent from './components/HomeContent'
import { createStaticClient } from '@/app/lib/supabase/static'

export const revalidate = 60 // ISR: 60秒ごとに再生成

async function getProjects() {
  const supabase = createStaticClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('order', { ascending: true })
  return projects || []
}

export default async function HomePage() {
  const projects = await getProjects()
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3)
  
  // カテゴリ別に集計
  const categoryStats = {
    'homepage': projects.filter(p => p.category === 'homepage').length,
    'landing-page': projects.filter(p => p.category === 'landing-page').length,
    'web-app': projects.filter(p => p.category === 'web-app').length,
    'mobile-app': projects.filter(p => p.category === 'mobile-app').length,
  }

  return (
    <MainLayout>
      <HomeContent 
        profiles={null}
        categoryStats={categoryStats}
        featuredProjects={featuredProjects}
      />
    </MainLayout>
  )
}