import { createClient } from '@/app/lib/supabase/server'
import ProjectsClient from './ProjectsClient'

export const revalidate = 30 // 30秒ごとに再検証

export default async function AdminProjectsPage() {
  const supabase = await createClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
  }

  return <ProjectsClient projects={projects || []} />
}