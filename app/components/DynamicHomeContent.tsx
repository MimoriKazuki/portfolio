'use client'

import { useState, useEffect } from 'react'
import ProjectCard from './ProjectCard'
import { ArrowRight, FolderOpen, FileText, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Project, Column, Notice } from '@/app/types'
import ProjectCardSkeleton from './skeletons/ProjectCardSkeleton'
import ColumnCardSkeleton from './skeletons/ColumnCardSkeleton'

export default function DynamicHomeContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([])
  const [latestColumns, setLatestColumns] = useState<Column[]>([])
  const [latestNotices, setLatestNotices] = useState<Notice[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 並列でデータを取得
        const [projectsRes, columnsRes, noticesRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/columns'),
          fetch('/api/notices')
        ])

        if (projectsRes.ok) {
          const projects = await projectsRes.json()
          if (Array.isArray(projects)) {
            // 注目フラグが立っているプロジェクトのみをフィルタリング（最大3つ）
            const featuredProjects = projects
              .filter((p: any) => p.featured === true)
              .slice(0, 3)
            setFeaturedProjects(featuredProjects)
          }
        }

        if (columnsRes.ok) {
          const columns = await columnsRes.json()
          if (Array.isArray(columns)) {
            setLatestColumns(columns.slice(0, 3))
          }
        }

        if (noticesRes.ok) {
          const notices = await noticesRes.json()
          if (Array.isArray(notices)) {
            setLatestNotices(notices.slice(0, 3))
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="max-w-[1023px] mx-auto px-8">
      {/* Latest Notices */}
      {(isLoading || latestNotices.length > 0) && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">お知らせ</h2>
            <Link
              href="/notices"
              className="inline-flex items-center gap-2 px-4 py-2 bg-portfolio-blue-dark text-white rounded-full hover:opacity-90 transition-opacity text-sm font-medium"
            >
              すべて見る <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="px-6 py-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="flex items-center gap-3">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-5 w-5 bg-gray-200 rounded ml-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
              {latestNotices.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/notices/${notice.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-portfolio-blue transition-colors mb-2 text-base">
                        {notice.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(notice.created_at).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          notice.category === 'news' ? 'bg-blue-100 text-blue-700' :
                          notice.category === 'webinar' ? 'bg-purple-100 text-purple-700' :
                          notice.category === 'event' ? 'bg-pink-100 text-pink-700' :
                          notice.category === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {notice.category === 'news' ? 'ニュース' :
                           notice.category === 'webinar' ? 'ウェビナー' :
                           notice.category === 'event' ? 'イベント' :
                           notice.category === 'maintenance' ? 'メンテナンス' :
                           'その他'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-portfolio-blue transition-colors ml-4 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Featured Projects */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">AI制作物</h2>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-portfolio-blue-dark text-white rounded-full hover:opacity-90 transition-opacity text-sm font-medium"
          >
            すべて見る <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </div>
        ) : featuredProjects.length === 0 ? (
          <div className="bg-youtube-gray rounded-lg p-12 text-center">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">No featured projects yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredProjects.map((project, index) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                priority={index < 3}
              />
            ))}
          </div>
        )}
      </section>
      
      {/* Columns Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">最新のコラム</h2>
          <Link
            href="/columns"
            className="inline-flex items-center gap-2 px-4 py-2 bg-portfolio-blue-dark text-white rounded-full hover:opacity-90 transition-opacity text-sm font-medium"
          >
            すべて見る <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, index) => (
              <ColumnCardSkeleton key={index} />
            ))}
          </div>
        ) : latestColumns.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-500">まだコラムがありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {latestColumns.map((column, index) => (
              <Link 
                key={column.id} 
                href={`/columns/${column.id}`}
                className="group"
              >
                <article className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  {column.thumbnail && (
                    <div className="relative aspect-video">
                      <Image
                        src={column.thumbnail}
                        alt={column.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority={index === 0} // 最初のコラム画像にpriorityを追加
                      />
                    </div>
                  )}
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-portfolio-blue transition-colors">
                      {column.title}
                    </h3>
                    
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {column.excerpt || ''}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(column.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
      
      {/* 問い合わせボタンとの重なりを防ぐためのスペース */}
      <div className="h-24" />
    </div>
  )
}