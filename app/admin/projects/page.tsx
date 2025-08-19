import { createClient } from '@/app/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, Trash2, ExternalLink, FolderOpen, Eye } from 'lucide-react'
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
    completed: 'bg-green-100 text-green-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    planned: 'bg-gray-100 text-gray-700'
  }

  const statusLabels = {
    completed: '完了',
    'in-progress': '進行中',
    planned: '計画中'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">プロジェクト管理</h1>
          <p className="text-gray-600">プロジェクトの追加・編集・削除を行えます</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          プロジェクトを追加
        </Link>
      </div>
      
      {!projects || projects.length === 0 ? (
        <div className="bg-white rounded-lg p-16 text-center border border-gray-200">
          <FolderOpen className="h-20 w-20 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900">プロジェクトがありません</h2>
          <p className="text-gray-600 mb-8">最初のプロジェクトを追加して実績を公開しましょう</p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-6 py-3 rounded-lg transition-colors text-lg"
          >
            <Plus className="h-6 w-6" />
            プロジェクトを追加
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-portfolio-blue">{projects.length}</div>
              <div className="text-sm text-gray-600">総プロジェクト数</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-green-600">
                {projects.filter(p => p.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">完了</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-yellow-600">
                {projects.filter(p => p.status === 'in-progress').length}
              </div>
              <div className="text-sm text-gray-600">進行中</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-purple-600">
                {projects.filter(p => p.featured).length}
              </div>
              <div className="text-sm text-gray-600">注目</div>
            </div>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">プロジェクト</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">ステータス</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">注目</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">リンク</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-700">アクション</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {project.thumbnail && (
                        <div className="relative w-16 h-10 flex-shrink-0">
                          <Image
                            src={project.thumbnail}
                            alt={project.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {project.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                      {statusLabels[project.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${project.featured ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {project.featured ? '注目' : '通常'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                          title="ライブサイト"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                          title="GitHub"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/projects/${project.id}`}
                        target="_blank"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                        title="プレビュー"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                        title="編集"
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
        </div>
      )}
    </div>
  )
}