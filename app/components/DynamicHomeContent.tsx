'use client'

import { useState, useEffect } from 'react'
import ProjectCard from './ProjectCard'
import { ArrowRight, FolderOpen, FileText, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Project, Column, Notice, YouTubeVideo } from '@/app/types'
import ProjectCardSkeleton from './skeletons/ProjectCardSkeleton'
import ColumnCardSkeleton from './skeletons/ColumnCardSkeleton'
import YouTubeVideoCard from '../youtube-videos/YouTubeVideoCard'

export default function DynamicHomeContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([])
  const [latestColumns, setLatestColumns] = useState<Column[]>([])
  const [latestNotices, setLatestNotices] = useState<Notice[]>([])
  const [displayVideos, setDisplayVideos] = useState<YouTubeVideo[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 並列でデータを取得
        const [projectsRes, columnsRes, noticesRes, videosRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/columns'),
          fetch('/api/notices'),
          fetch('/api/youtube-videos')
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

        if (videosRes.ok) {
          const data = await videosRes.json()
          if (data.youtubeVideos && Array.isArray(data.youtubeVideos)) {
            const videos = data.youtubeVideos
            // 注目動画を優先、不足分は最新動画で埋める（最大3つ）
            const featuredVideos = videos.filter((v: YouTubeVideo) => v.featured === true)
            const nonFeaturedVideos = videos.filter((v: YouTubeVideo) => v.featured !== true)
            const displayList = [
              ...featuredVideos,
              ...nonFeaturedVideos.slice(0, Math.max(0, 3 - featuredVideos.length))
            ].slice(0, 3)
            setDisplayVideos(displayList)
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
    <div className="max-w-[1023px] mx-auto">
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
            <div className="divide-y divide-gray-200">
              {latestNotices.map((notice) => {
                const formatDate = (dateString: string) => {
                  const date = new Date(dateString)
                  const year = date.getFullYear()
                  const month = (date.getMonth() + 1).toString().padStart(2, '0')
                  const day = date.getDate().toString().padStart(2, '0')
                  return `${year}.${month}.${day}`
                }

                return (
                  <Link
                    key={notice.id}
                    href={`/notices/${notice.id}`}
                    className="block group"
                  >
                    <div className="py-6 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center gap-4 px-2">
                        {/* Date */}
                        <div className="text-sm text-gray-600 font-medium w-24 flex-shrink-0">
                          {formatDate(notice.created_at)}
                        </div>
                        
                        {/* Category */}
                        <div className="w-24 flex-shrink-0">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium border ${
                            notice.category === 'news' ? 'border-blue-200 text-blue-700' :
                            notice.category === 'webinar' ? 'border-purple-200 text-purple-700' :
                            notice.category === 'event' ? 'border-pink-200 text-pink-700' :
                            notice.category === 'maintenance' ? 'border-yellow-200 text-yellow-700' :
                            'border-gray-200 text-gray-700'
                          }`}>
                            {notice.category === 'news' ? 'ニュース' :
                             notice.category === 'webinar' ? 'ウェビナー' :
                             notice.category === 'event' ? 'イベント' :
                             notice.category === 'maintenance' ? 'メンテナンス' :
                             'その他'}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <h3 className="flex-1 font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {notice.title}
                        </h3>

                        {/* Arrow Icon */}
                        <div className="w-5 flex-shrink-0">
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
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
          <div className="grid grid-cols-1 md:grid-cols-1 mid:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-1 mid:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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

      {/* YouTube Videos Section */}
      {(isLoading || displayVideos.length > 0) && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">YouTube</h2>
            <Link
              href="/youtube-videos"
              className="inline-flex items-center gap-2 px-4 py-2 bg-portfolio-blue-dark text-white rounded-full hover:opacity-90 transition-opacity text-sm font-medium"
            >
              すべて見る <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-1 mid:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg aspect-video mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-1 mid:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {displayVideos.map((video) => (
                <YouTubeVideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </section>
      )}

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
          <div className="grid grid-cols-1 md:grid-cols-1 mid:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-1 mid:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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