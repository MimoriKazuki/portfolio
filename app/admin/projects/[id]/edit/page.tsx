import { createClient } from '@/app/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProjectForm from '../../ProjectForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !project) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">ポートフォリオを編集</h1>
      
      <div className="bg-youtube-gray rounded-lg">
        <ProjectForm initialData={project} projectId={id} />
      </div>
    </div>
  )
}