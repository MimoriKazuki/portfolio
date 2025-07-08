import { createClient } from '@/app/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProjectForm from '../../ProjectForm'

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !project) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">プロジェクトを編集</h1>
      
      <div className="bg-youtube-gray rounded-lg p-6">
        <ProjectForm initialData={project} projectId={params.id} />
      </div>
    </div>
  )
}