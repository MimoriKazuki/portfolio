import { createClient } from '@/app/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Clock, User, Globe, Github, Play, Download, Tag, Star, Activity } from 'lucide-react'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/app/lib/constants/project'

export default async function ProjectDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
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

  const statusLabels = {
    'completed': '完了',
    'in-progress': '進行中', 
    'planned': '計画中'
  }

  const statusColors = {
    'completed': 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'planned': 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/admin/projects" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            制作実績一覧に戻る
          </Link>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <Link 
              href={`/admin/projects/${project.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              編集
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Image */}
            {project.thumbnail && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-video relative">
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">プロジェクト概要</h2>
              <p className="text-gray-700 leading-relaxed">{project.description}</p>
            </div>

            {/* Technologies */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">使用技術</h2>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: string, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Content */}
            {project.prompt && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">プロンプト</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{project.prompt}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">プロジェクト情報</h2>
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">ステータス</div>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status as keyof typeof statusColors]}`}>
                      {statusLabels[project.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">カテゴリ</div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[project.category]}`}>
                      {CATEGORY_LABELS[project.category]}
                    </span>
                  </div>
                </div>

                {/* Duration */}
                {project.duration && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">制作期間</div>
                      <div className="text-sm font-medium text-gray-900">{project.duration}</div>
                    </div>
                  </div>
                )}

                {/* Client */}
                {project.client && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">クライアント</div>
                      <div className="text-sm font-medium text-gray-900">{project.client}</div>
                    </div>
                  </div>
                )}

                {/* Featured */}
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">注目プロジェクト</div>
                    <span className={`text-sm font-medium ${project.featured ? 'text-green-600' : 'text-gray-600'}`}>
                      {project.featured ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">作成日</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(project.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Links */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">リンク</h2>
              <div className="space-y-3">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Globe className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">ライブサイトを見る</span>
                  </a>
                )}

                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Github className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">GitHubリポジトリ</span>
                  </a>
                )}

                {project.video_url && (
                  <a
                    href={project.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Play className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">解説動画を見る</span>
                  </a>
                )}

                {project.prompt_filename && (
                  <a
                    href={`/api/projects/${project.id}/prompt`}
                    download
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">プロンプトをダウンロード</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}