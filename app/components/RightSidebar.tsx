'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'
import { Column, Project, Document } from '@/app/types'
import { Calendar, Clock, FileText } from 'lucide-react'

const RightSidebar = () => {
  const pathname = usePathname()
  const [columns, setColumns] = useState<Column[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      // Fetch latest columns
      const { data: columnsData } = await supabase
        .from('columns')
        .select('*')
        .eq('is_published', true)
        .order('published_date', { ascending: false })
        .limit(2)
      
      // Fetch featured projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(2)
      
      // Fetch documents
      const { data: documentsData } = await supabase
        .from('documents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (columnsData) setColumns(columnsData)
      if (projectsData) setProjects(projectsData)
      if (documentsData) setDocuments(documentsData)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // パスに基づいて表示するコンテンツを決定
  const isProjectsPage = pathname.startsWith('/projects')
  const isColumnsPage = pathname.startsWith('/columns')

  return (
    <div className="sticky top-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">おすすめコンテンツ</h3>
        <div className="space-y-4">
          {/* ポートフォリオページ配下では記事を表示 */}
          {isProjectsPage && (
            <>
              {columns.map((column) => (
                <Link
                  key={column.id}
                  href={`/columns/${column.slug}`}
                  className="block group"
                >
                  <article className="block border-2 border-transparent rounded-lg p-3 transition-all duration-200 hover:border-portfolio-blue">
                    {column.thumbnail && (
                      <div className="relative aspect-video mb-3">
                        <Image
                          src={column.thumbnail}
                          alt={column.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-portfolio-blue transition-colors line-clamp-2 mb-1">
                        {column.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(column.published_date).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </>
          )}

          {/* コラムページ配下では実績を表示 */}
          {isColumnsPage && (
            <>
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block group"
                >
                  <article className="block border-2 border-transparent rounded-lg p-3 transition-all duration-200 hover:border-portfolio-blue">
                    <div className="relative aspect-video mb-3">
                      <Image
                        src={project.thumbnail}
                        alt={project.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-portfolio-blue transition-colors line-clamp-2 mb-2">
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          project.category === 'homepage' ? 'bg-purple-100 text-purple-700' :
                          project.category === 'landing-page' ? 'bg-pink-100 text-pink-700' :
                          project.category === 'web-app' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {project.category === 'homepage' ? 'ホームページ' :
                           project.category === 'landing-page' ? 'LP' :
                           project.category === 'web-app' ? 'Webアプリ' :
                           'モバイル'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{project.duration}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </>
          )}

          {/* 資料 - 全ページで表示 */}
          {documents.map((document) => (
            <Link
              key={document.id}
              href={`/documents/request/${document.id}`}
              className="block group"
            >
              <article className="block border-2 border-transparent rounded-lg p-3 transition-all duration-200 hover:border-portfolio-blue">
                {document.thumbnail && (
                  <div className="relative aspect-video mb-3">
                    <Image
                      src={document.thumbnail}
                      alt={document.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-portfolio-blue transition-colors line-clamp-2 mb-1">
                    {document.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FileText className="w-3 h-3" />
                    <span>資料ダウンロード</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RightSidebar