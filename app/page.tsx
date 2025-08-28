import MainLayout from './components/MainLayout'
import HomeContent from './components/HomeContent'
import { createStaticClient } from '@/app/lib/supabase/static'

export const revalidate = 60 // ISR: 60秒ごとに再生成

async function getProjects() {
  const supabase = createStaticClient()
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching projects:', error)
  }
  
  return projects || []
}

async function getLatestColumns() {
  const supabase = createStaticClient()
  const { data: columns, error } = await supabase
    .from('columns')
    .select('*')
    .eq('is_published', true)
    .order('published_date', { ascending: false })
    .limit(3)
  
  if (error) {
    console.error('Error fetching columns:', error)
  }
  
  return columns || []
}

async function getLatestNotices() {
  const supabase = createStaticClient()
  const { data: notices, error } = await supabase
    .from('notices')
    .select('*')
    .eq('is_published', true)
    .order('published_date', { ascending: false })
    .limit(3)
  
  if (error) {
    console.error('Error fetching notices:', error)
  }
  
  return notices || []
}

export default async function HomePage() {
  const projects = await getProjects()
  const columns = await getLatestColumns()
  const notices = await getLatestNotices()
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3)
  
  // カテゴリ別に集計
  const categoryStats = {
    'homepage': projects.filter(p => p.category === 'homepage').length,
    'landing-page': projects.filter(p => p.category === 'landing-page').length,
    'web-app': projects.filter(p => p.category === 'web-app').length,
    'mobile-app': projects.filter(p => p.category === 'mobile-app').length,
    'video': projects.filter(p => p.category === 'video').length,
  }

  return (
    <MainLayout hideRightSidebar={true}>
      <HomeContent 
        profiles={null}
        categoryStats={categoryStats}
        featuredProjects={featuredProjects}
        latestColumns={columns}
        latestNotices={notices}
      />
    </MainLayout>
  )
}