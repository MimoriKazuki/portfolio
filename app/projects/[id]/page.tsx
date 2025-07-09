import { notFound } from 'next/navigation'
import { ExternalLink, Github, Clock, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MainLayout from '@/app/components/MainLayout'
import { createStaticClient } from '@/app/lib/supabase/static'

// 静的パラメータを生成
export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
  
  return projects?.map((project) => ({
    id: project.id,
  })) || []
}

// プロジェクトデータを取得
async function getProject(id: string) {
  const supabase = createStaticClient()
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  
  return project
}

// Next.js 15の新しい形式に対応
export default async function ProjectDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params
  const project = await getProject(resolvedParams.id)

  if (!project) {
    notFound()
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
    <MainLayout>
      <div className="p-4 sm:p-6 pt-2 sm:pt-3">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          プロジェクト一覧に戻る
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{project.title}</h1>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Left column - Thumbnail */}
          <div className="lg:w-1/2">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={project.thumbnail}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
              <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 ${categoryColors[project.category]} text-white text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded`}>
                {categoryLabels[project.category]}
              </div>
            </div>
            
            {/* Action buttons below thumbnail */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                  サイトを見る
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-youtube-gray hover:bg-youtube-gray/80 rounded-lg transition-colors text-white"
                >
                  <Github className="w-4 h-4" />
                  ソースコード
                </a>
              )}
            </div>
          </div>

          {/* Right column - Project details */}
          <div className="lg:w-1/2 space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2 text-white">プロジェクト概要</h2>
                <p className="text-gray-300 leading-relaxed">{project.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-base font-medium text-gray-400 mb-2">開発期間</h3>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>{project.duration}</span>
                  </div>
                </div>
                
                {project.client && (
                  <div>
                    <h3 className="text-base font-medium text-gray-400 mb-2">クライアント</h3>
                    <p className="text-gray-300">{project.client}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-400 mb-2">使用技術</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: string) => (
                    <span key={tech} className="bg-youtube-gray px-3 py-1 rounded text-sm text-white">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

          </div>
        </div>
      </div>
    </MainLayout>
  )
}