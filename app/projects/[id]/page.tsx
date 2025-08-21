import { notFound } from 'next/navigation'
import { ExternalLink, Github, Clock, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MainLayout from '@/app/components/MainLayout'
import { createStaticClient } from '@/app/lib/supabase/static'
import { createClient } from '@/app/lib/supabase/server'
import type { Metadata } from 'next'

export const revalidate = 60 // ISR: 60秒ごとに再生成
export const dynamicParams = true // 動的パラメータを許可
export const fetchCache = 'force-no-store' // キャッシュを無効化

// 静的パラメータを生成
export async function generateStaticParams() {
  try {
    const supabase = createStaticClient()
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
    
    return projects?.map((project) => ({
      id: project.id,
    })) || []
  } catch (error) {
    console.error('Error in generateStaticParams:', error)
    return []
  }
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

// 関連プロジェクトを取得
async function getRelatedProjects(currentProjectId: string, category: string) {
  const supabase = await createClient()
  const { data: relatedProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('category', category)
    .neq('id', currentProjectId)
    .order('created_at', { ascending: false })
    .limit(3)
  
  return relatedProjects || []
}

// メタデータを生成
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params
  const project = await getProject(resolvedParams.id)
  
  if (!project) {
    return {
      title: 'LandBridge Media',
      description: 'LandBridge株式会社の開発実績をご紹介。',
    }
  }
    
    const baseUrl = 'https://www.landbridge.ai'
  
    // サムネイル画像のURLを完全なURLに変換（Teamsキャッシュ対策でタイムスタンプ追加）
    const timestamp = Date.now()
    let imageUrl: string
    if (project.thumbnail) {
      if (project.thumbnail.startsWith('http')) {
        imageUrl = `${project.thumbnail}?t=${timestamp}`
      } else if (project.thumbnail.startsWith('/')) {
        imageUrl = `${baseUrl}${project.thumbnail}?t=${timestamp}`
      } else {
        // Supabaseストレージの相対パス
        imageUrl = `${project.thumbnail}?t=${timestamp}`
      }
    } else {
      // サムネイルがない場合は動的OG画像を使用
      imageUrl = `${baseUrl}/projects/${project.id}/opengraph-image?t=${timestamp}`
    }
  
  const metadata: Metadata = {
      title: `${project.title} - LandBridge Media`,
      description: project.description,
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: `/projects/${project.id}`,
      },
      openGraph: {
        title: project.title,
        description: project.description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: project.title,
            type: 'image/png',
          }
        ],
        type: 'article',
        siteName: 'LandBridge Media',
        url: `${baseUrl}/projects/${project.id}`,
        locale: 'ja_JP',
      },
      twitter: {
        card: 'summary_large_image',
        title: project.title,
        description: project.description,
        images: [imageUrl],
        creator: '@landbridge_jp',
      },
      other: {
        'msapplication-TileImage': imageUrl,
      },
      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    }
  
  return metadata
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

  // 関連プロジェクトを取得
  const relatedProjects = await getRelatedProjects(project.id, project.category)

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
    <MainLayout>
      <div className="p-4 sm:p-6 pt-2 sm:pt-3">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          プロジェクト一覧に戻る
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">{project.title}</h1>

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
              <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 ${categoryColors[project.category]} text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded`}>
                {categoryLabels[project.category]}
              </div>
            </div>
            
            {/* Action buttons below thumbnail */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-portfolio-blue-dark hover:opacity-90 rounded-full transition-opacity text-white text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  サイトを見る
                </a>
              )}
              {project.prompt && (
                <Link
                  href={`/projects/${project.id}/prompt`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-full transition-colors text-white text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  プロンプトを見る
                </Link>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors text-white"
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
                <h2 className="text-lg font-semibold mb-2 text-gray-900">プロジェクト概要</h2>
                <p className="text-gray-700 leading-relaxed">{project.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-base font-medium text-gray-600 mb-2">開発期間</h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>{project.duration}</span>
                  </div>
                </div>
                
                {project.client && (
                  <div>
                    <h3 className="text-base font-medium text-gray-600 mb-2">クライアント</h3>
                    <p className="text-gray-700">{project.client}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-600 mb-2">使用技術</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: string) => (
                    <span key={tech} className="bg-gray-100 border border-gray-200 px-3 py-1 rounded text-sm text-gray-700">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

          </div>
        </div>

        {/* 関連プロジェクト */}
        {relatedProjects.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">関連実績</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((relatedProject) => (
                <Link 
                  key={relatedProject.id} 
                  href={`/projects/${relatedProject.id}`}
                  className="group"
                >
                  <article className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    <div className="relative aspect-video">
                      <Image
                        src={relatedProject.thumbnail}
                        alt={relatedProject.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className={`absolute top-4 right-4 ${categoryColors[relatedProject.category]} text-xs px-3 py-1 rounded`}>
                        {categoryLabels[relatedProject.category]}
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-portfolio-blue transition-colors">
                        {relatedProject.title}
                      </h3>
                      
                      <div className="flex-1">
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {relatedProject.description || ''}
                        </p>
                      </div>
                      
                      {relatedProject.duration && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{relatedProject.duration}</span>
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  )
}