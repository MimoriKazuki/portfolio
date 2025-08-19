import { createClient } from '@/app/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, Trash2, ExternalLink, FolderOpen, Eye, Calendar } from 'lucide-react'
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

  const categoryColors = {
    'homepage': 'bg-purple-100 text-purple-700',
    'landing-page': 'bg-pink-100 text-pink-700',
    'web-app': 'bg-blue-100 text-blue-700',
    'mobile-app': 'bg-green-100 text-green-700'
  }

  const categoryLabels = {
    'homepage': 'ホームページ',
    'landing-page': 'ランディングページ',
    'web-app': 'Webアプリ',
    'mobile-app': 'モバイルアプリ'
  }

  return (
    <div className="w-full">
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-portfolio-blue">{projects.length}</div>
              <div className="text-sm text-gray-600">総プロジェクト数</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-purple-600">
                {projects.filter(p => p.category === 'homepage').length}
              </div>
              <div className="text-sm text-gray-600">ホームページ</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-pink-600">
                {projects.filter(p => p.category === 'landing-page').length}
              </div>
              <div className="text-sm text-gray-600">ランディングページ</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-blue-600">
                {projects.filter(p => p.category === 'web-app').length}
              </div>
              <div className="text-sm text-gray-600">Webアプリ</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-green-600">
                {projects.filter(p => p.category === 'mobile-app').length}
              </div>
              <div className="text-sm text-gray-600">モバイルアプリ</div>
            </div>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-40 text-center px-6 py-3 text-sm font-medium text-gray-700">画像</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">内容</th>
                  <th className="w-[200px] text-center px-6 py-3 text-sm font-medium text-gray-700">カテゴリ</th>
                  <th className="w-[120px] text-center px-6 py-3 text-sm font-medium text-gray-700">注目</th>
                  <th className="w-[120px] text-center px-6 py-3 text-sm font-medium text-gray-700">アクション</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="w-40 px-6 py-4">
                    <div className="flex justify-center">
                      {project.thumbnail ? (
                        <div className="relative w-20 h-12 flex-shrink-0">
                          <Image
                            src={project.thumbnail}
                            alt={project.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <FolderOpen className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-left min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{project.title}</h3>
                      <p className="text-sm text-gray-600 truncate">
                        {project.description}
                      </p>
                    </div>
                  </td>
                  <td className="w-[200px] px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${categoryColors[project.category]}`}>
                      {categoryLabels[project.category]}
                    </span>
                  </td>
                  <td className="w-[120px] px-6 py-4 text-center text-sm">
                    <span className={project.featured ? 'text-green-600 font-medium' : 'text-gray-600'}>
                      {project.featured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="w-[120px] px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
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