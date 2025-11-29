import { notFound } from 'next/navigation'
import { ExternalLink, Github, Clock, ArrowLeft, Download } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MainLayout from '@/app/components/MainLayout'
import VideoPlayer from './VideoPlayer'
import { createStaticClient } from '@/app/lib/supabase/static'
import { createClient } from '@/app/lib/supabase/server'
import { CATEGORY_COLORS, CATEGORY_BORDER_COLORS, CATEGORY_LABELS, PROJECT_BUTTON_STYLES } from '@/app/lib/constants/project'
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
    .select('*, enterprise_service, individual_service')
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
      title: 'AI駆動研究所',
      description: 'AI駆動研究所の開発実績をご紹介。',
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
      title: `${project.title} - AI駆動研究所`,
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
        siteName: 'AI駆動研究所',
        url: `${baseUrl}/projects/${project.id}`,
        locale: 'ja_JP',
      },
      twitter: {
        card: 'summary_large_image',
        title: project.title,
        description: project.description,
        images: [imageUrl],
        creator: '@ai_driven_lab',
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

  return (
    <MainLayout
      dynamicSidebar={{
        enterpriseServiceId: project.enterprise_service,
        individualServiceId: project.individual_service
      }}
    >
      <div className="p-4 sm:p-6 pt-2 sm:pt-3">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          制作実績一覧に戻る
        </Link>

        {/* Thumbnail or Video - Full width */}
        {project.category === 'video' && project.live_url ? (
          <div className="mb-4">
            <VideoPlayer
              thumbnail={project.thumbnail}
              videoUrl={project.live_url}
              title={project.title}
            />
          </div>
        ) : (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-4">
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Project Info */}
        <div className="space-y-4">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{project.title}</h1>

          {/* Meta info and action buttons row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-gray-200">
            {/* Left side - Meta info */}
            <div className="flex flex-col gap-2">
              {/* 1行目: カテゴリバッジ、クライアント */}
              <div className="flex flex-wrap items-center gap-4">
                {/* カテゴリバッジ */}
                <span className={`${CATEGORY_BORDER_COLORS[project.category]} bg-white text-xs px-3 py-1 border font-medium`}>
                  {CATEGORY_LABELS[project.category]}
                </span>
                {/* クライアント */}
                {project.client && (
                  <span className="text-sm font-medium text-gray-900">{project.client}</span>
                )}
              </div>
              {/* 2行目: 制作期間 */}
              {project.duration && (
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">制作期間</h3>
                  <div className="text-sm text-gray-700">{project.duration}</div>
                </div>
              )}
              {/* 3行目: 使用技術 */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">使用技術</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech: string) => (
                      <span key={tech} className="bg-white border border-gray-200 px-3 py-1 rounded text-sm text-gray-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {project.live_url && project.category !== 'video' && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white rounded-full transition-all font-medium text-sm whitespace-nowrap"
                >
                  <ExternalLink className="w-4 h-4" />
                  サイトを見る
                </a>
              )}
              {project.video_url && (
                <a
                  href={project.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all font-medium text-sm whitespace-nowrap"
                >
                  <ExternalLink className="w-4 h-4" />
                  解説動画
                </a>
              )}
              {project.prompt && (
                <Link
                  href={`/projects/${project.id}/prompt`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all font-medium text-sm whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  プロンプト
                </Link>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-full transition-all font-medium text-sm whitespace-nowrap"
                >
                  <Github className="w-4 h-4" />
                  ソースコード
                </a>
              )}
            </div>
          </div>

          {/* Description box - scrollable */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="max-h-80 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          </div>
        </div>

        {/* 関連プロジェクト */}
        {relatedProjects.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">関連実績</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {relatedProjects.map((relatedProject) => (
                <Link
                  key={relatedProject.id}
                  href={`/projects/${relatedProject.id}`}
                  className="group"
                >
                  <article className="border-2 border-transparent hover:border-gray-200 rounded p-4 transition-colors duration-300 h-full flex flex-col">
                    <div className="relative aspect-video overflow-hidden rounded">
                      <Image
                        src={relatedProject.thumbnail}
                        alt={relatedProject.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className={`absolute top-2 right-2 bg-white border ${CATEGORY_BORDER_COLORS[relatedProject.category]} text-xs px-3 py-1 font-medium`}>
                        {CATEGORY_LABELS[relatedProject.category]}
                      </div>
                    </div>

                    <div className="pt-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {relatedProject.title}
                      </h3>

                      <div className="flex-1">
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
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