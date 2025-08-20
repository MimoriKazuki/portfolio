import { createClient } from '@/app/lib/supabase/server'
import ProjectsClient from './ProjectsClient'

export default async function AdminProjectsPage() {
  const supabase = await createClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching projects:', error)
  }

  return <ProjectsClient projects={projects || []} />
}