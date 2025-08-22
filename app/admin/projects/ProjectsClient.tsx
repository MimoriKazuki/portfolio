'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, FolderOpen, Search, Filter, FileText } from 'lucide-react'
import Image from 'next/image'
import DeleteProjectButton from './DeleteProjectButton'

interface Project {
  id: string
  title: string
  description: string
  thumbnail: string
  category: 'homepage' | 'landing-page' | 'web-app' | 'mobile-app' | 'video'
  featured: boolean
  order: number
  prompt?: string
}

interface ProjectsClientProps {
  projects: Project[]
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const categoryColors = {
    'homepage': 'bg-purple-100 text-purple-700',
    'landing-page': 'bg-pink-100 text-pink-700',
    'web-app': 'bg-blue-100 text-blue-700',
    'mobile-app': 'bg-green-100 text-green-700',
    'video': 'bg-orange-100 text-orange-700'
  }

  const categoryLabels = {
    'homepage': 'ホームページ',
    'landing-page': 'ランディングページ',
    'web-app': 'Webアプリ',
    'mobile-app': 'モバイルアプリ',
    'video': '動画制作'
  }

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = searchQuery === '' || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [projects, searchQuery, categoryFilter])

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">ポートフォリオ管理</h1>
      
      {!projects || projects.length === 0 ? (
        <div className="bg-white rounded-lg p-16 text-center border border-gray-200">
          <FolderOpen className="h-20 w-20 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900">ポートフォリオがありません</h2>
          <p className="text-gray-600 mb-8">最初のポートフォリオを追加して実績を公開しましょう</p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-6 py-3 rounded-lg transition-colors text-lg"
          >
            <Plus className="h-6 w-6" />
            ポートフォリオを追加
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-orange-600">
                {projects.filter(p => p.category === 'video').length}
              </div>
              <div className="text-sm text-gray-600">動画制作</div>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/admin/projects/new"
              className="flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              ポートフォリオを追加
            </Link>

            <div className="flex items-center gap-4 flex-1 justify-end">
              {/* Category filter */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                >
                  <option value="all">すべてのカテゴリ</option>
                  <option value="homepage">ホームページ</option>
                  <option value="landing-page">ランディングページ</option>
                  <option value="web-app">Webアプリ</option>
                  <option value="mobile-app">モバイルアプリ</option>
                  <option value="video">動画制作</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Search box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900 w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
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
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      検索結果が見つかりませんでした
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
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
                          <h3 className="font-medium text-gray-900 truncate flex items-center gap-2">
                            {project.title}
                            {project.prompt && (
                              <span className="text-emerald-600" title="プロンプトあり">
                                <FileText className="h-4 w-4" />
                              </span>
                            )}
                          </h3>
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
                          {project.featured ? 'ON' : 'OFF'}
                        </span>
                      </td>
                      <td className="w-[120px] px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/projects/${project.id}/edit`}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="編集"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}