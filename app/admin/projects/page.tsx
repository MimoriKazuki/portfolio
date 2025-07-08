import { createClient } from '@/app/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, Trash2, ExternalLink, FolderOpen } from 'lucide-react'
import Image from 'next/image'
import DeleteProjectButton from './DeleteProjectButton'

export default async function AdminProjectsPage() {
  const supabase = await createClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching projects:', error)
  }

  const statusColors = {
    completed: 'bg-green-600',
    'in-progress': 'bg-yellow-600',
    planned: 'bg-gray-600'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Project
        </Link>
      </div>
      
      {!projects || projects.length === 0 ? (
        <div className="bg-youtube-gray rounded-lg p-12 text-center">
          <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl text-muted-foreground mb-4">No projects yet</p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="bg-youtube-gray rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4">Project</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Featured</th>
                <th className="text-left p-4">Links</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-border hover:bg-youtube-dark transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-9 relative rounded overflow-hidden">
                        <Image
                          src={project.thumbnail}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {project.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`${statusColors[project.status]} text-white text-xs px-2 py-1 rounded`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm ${project.featured ? 'text-green-500' : 'text-gray-500'}`}>
                      {project.featured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-youtube-red hover:text-red-400 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-youtube-red hover:text-red-400 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="p-2 hover:bg-youtube-dark rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}