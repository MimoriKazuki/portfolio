import { createClient } from '@/app/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, Trash2, ExternalLink, FolderOpen, Eye, Clock } from 'lucide-react'
import Image from 'next/image'
import DeleteProjectButton from './projects/DeleteProjectButton'

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching projects:', error)
  }

  const categoryColors = {
    'homepage': 'bg-purple-600',
    'landing-page': 'bg-pink-600',
    'web-app': 'bg-blue-600',
    'mobile-app': 'bg-green-600'
  }

  const categoryLabels = {
    'homepage': 'ホームページ',
    'landing-page': 'ランディングページ',
    'web-app': 'Webアプリ',
    'mobile-app': 'モバイルアプリ'
  }


  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">ポートフォリオ管理</h1>
          <p className="text-gray-400">プロジェクトの追加・編集・削除を行えます</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Eye className="h-5 w-5" />
            サイトを見る
          </Link>
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            プロジェクトを追加
          </Link>
        </div>
      </div>
      
      {!projects || projects.length === 0 ? (
        <div className="bg-youtube-gray rounded-lg p-16 text-center">
          <FolderOpen className="h-20 w-20 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4">プロジェクトがありません</h2>
          <p className="text-gray-400 mb-8">最初のプロジェクトを追加してポートフォリオを作成しましょう</p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors text-lg"
          >
            <Plus className="h-6 w-6" />
            プロジェクトを追加
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-youtube-gray rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-400">{projects.length}</div>
              <div className="text-sm text-gray-400">総プロジェクト</div>
            </div>
            <div className="bg-youtube-gray rounded-lg p-6">
              <div className="text-3xl font-bold text-yellow-400">
                {projects.filter(p => p.featured).length}
              </div>
              <div className="text-sm text-gray-400">注目</div>
            </div>
            <div className="bg-youtube-gray rounded-lg p-6">
              <div className="text-3xl font-bold text-purple-400">
                {projects.filter(p => p.category === 'homepage').length}
              </div>
              <div className="text-sm text-gray-400">ホームページ</div>
            </div>
            <div className="bg-youtube-gray rounded-lg p-6">
              <div className="text-3xl font-bold text-pink-400">
                {projects.filter(p => p.category === 'landing-page').length}
              </div>
              <div className="text-sm text-gray-400">ランディングページ</div>
            </div>
            <div className="bg-youtube-gray rounded-lg p-6">
              <div className="text-3xl font-bold text-cyan-400">
                {projects.filter(p => p.category === 'web-app').length}
              </div>
              <div className="text-sm text-gray-400">Webアプリ</div>
            </div>
            <div className="bg-youtube-gray rounded-lg p-6">
              <div className="text-3xl font-bold text-green-400">
                {projects.filter(p => p.category === 'mobile-app').length}
              </div>
              <div className="text-sm text-gray-400">モバイルアプリ</div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-youtube-gray rounded-lg overflow-hidden hover:bg-youtube-dark transition-colors group">
                <div className="relative aspect-video">
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                  <div className={`absolute top-2 right-2 ${categoryColors[project.category]} text-white text-xs px-2 py-1 rounded`}>
                    {categoryLabels[project.category]}
                  </div>
                  {project.featured && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Featured
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <h3 className="font-medium text-sm leading-5 line-clamp-2 mb-1 group-hover:text-white transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span key={tech} className="text-xs bg-youtube-dark px-2 py-0.5 rounded">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>開発期間: {project.duration}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-youtube-dark rounded-lg transition-colors"
                          title="サイトを見る"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="p-2 hover:bg-youtube-dark rounded-lg transition-colors"
                        title="編集"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      
                      <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}