'use client'

import { useState, useEffect } from 'react'
import ProjectCard from './ProjectCard'
import { ArrowRight, FolderOpen, FileText, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Project, Column, Notice, YouTubeVideo } from '@/app/types'
import YouTubeVideoCard from '../youtube-videos/YouTubeVideoCard'
import { ScrollAnimation, StaggerContainer } from './ui/scroll-animation'

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
    <div>
      {/* Latest Notices - フルワイド背景 */}
      {latestNotices.length > 0 && (
        <section className="mb-12 -mx-4 sm:-mx-6 lg:-mx-8 bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1023px] mx-auto">
            <ScrollAnimation animation="fadeUp">
              {/* セクションラベル */}
              <div className="mb-2">
                <span className="text-2xl font-medium text-blue-600 tracking-tight">News</span>
              </div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold md:text-3xl tracking-tight">お知らせ</h2>
              <Link
                href="/notices"
                className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm"
              >
                <span className="tracking-wider">VIEW ALL</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
            </ScrollAnimation>

            {latestNotices.length > 0 && (
              <ScrollAnimation animation="fadeUp" delay={0.2}>
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
                        <div className="py-6 hover:bg-gray-50 transition-colors duration-200 px-2">
                          {/* 720px以上: 1行表示 */}
                          <div className="hidden mid:flex items-center gap-4">
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

                          {/* 720px未満: 2行表示 */}
                          <div className="mid:hidden">
                            <div className="flex items-center gap-3 mb-2">
                              {/* Date */}
                              <div className="text-sm text-gray-600 font-medium">
                                {formatDate(notice.created_at)}
                              </div>

                              {/* Category */}
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

                            {/* Title with Arrow */}
                            <div className="flex items-center gap-2">
                              <h3 className="flex-1 font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {notice.title}
                              </h3>
                              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </ScrollAnimation>
            )}
          </div>
        </section>
      )}

      {/* メインコンテンツエリア */}
      <div className="max-w-[1023px] mx-auto">

      {/* Featured Projects */}
      <section className="mb-12">
        <ScrollAnimation animation="fadeUp">
          {/* セクションラベル */}
          <div className="mb-2">
            <span className="text-2xl font-medium text-blue-600 tracking-tight">Contents</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold md:text-3xl tracking-tight">制作実績</h2>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >
              <span className="tracking-wider">VIEW ALL</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </ScrollAnimation>
        
        {featuredProjects.length === 0 && !isLoading ? (
          <div className="bg-youtube-gray rounded-lg p-12 text-center">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">No featured projects yet</p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-1 mid:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project, index) => (
              <div key={project.id} className={index >= 2 ? 'mid:hidden lg:block' : ''}>
                <ProjectCard
                  project={project}
                  priority={index < 3}
                />
              </div>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* YouTube Videos Section */}
      {displayVideos.length > 0 && (
        <section className="mb-12">
          <ScrollAnimation animation="fadeUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold md:text-3xl tracking-tight">YouTube</h2>
              <Link
                href="/youtube-videos"
                className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm"
              >
                <span className="tracking-wider">VIEW ALL</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </ScrollAnimation>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-1 mid:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayVideos.map((video, index) => (
              <div key={video.id} className={index >= 2 ? 'mid:hidden lg:block' : ''}>
                <YouTubeVideoCard video={video} />
              </div>
            ))}
          </StaggerContainer>
        </section>
      )}

      {/* Columns Section */}
      <section className="mb-12">
        <ScrollAnimation animation="fadeUp">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold md:text-3xl tracking-tight">最新のコラム</h2>
            <Link
              href="/columns"
              className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >
              <span className="tracking-wider">VIEW ALL</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </ScrollAnimation>

        {latestColumns.length === 0 && !isLoading ? (
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-500">まだコラムがありません</p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-1 mid:grid-cols-2 lg:grid-cols-3 gap-3">
            {latestColumns.map((column, index) => (
              <Link
                key={column.id}
                href={`/columns/${column.id}`}
                className={`group ${index >= 2 ? 'mid:hidden lg:block' : ''}`}
              >
                <article className="overflow-hidden border-2 border-transparent hover:border-gray-200 transition-colors duration-300 h-full flex flex-col p-4 rounded">
                  {column.thumbnail && (
                    <div className="relative aspect-video overflow-hidden rounded">
                      <Image
                        src={column.thumbnail}
                        alt={column.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                  )}

                  <div className="pt-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
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
          </StaggerContainer>
        )}
      </section>
      </div>
      {/* メインコンテンツエリア終了 */}

      {/* 最終CTA セクション - フルワイド */}
      <section className="mt-16 -mx-4 sm:-mx-6 lg:-mx-8 -mb-8">
        <ScrollAnimation animation="fadeUp">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* 資料請求 */}
            <Link
              href="/documents"
              className="group relative block overflow-hidden"
            >
              <div className="relative h-[320px] md:h-[400px]">
                {/* 背景画像 */}
                <Image
                  src="/images/cta/document.jpg"
                  alt="資料請求"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* オーバーレイ */}
                <div className="absolute inset-0 bg-black/60" />
                
                {/* コンテンツ */}
                <div className="absolute inset-0 flex items-center justify-center text-white text-center px-6">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                      DOCUMENT
                    </h3>
                    <p className="text-lg font-medium mb-4">資料請求</p>
                    <p className="text-sm text-gray-200 mb-8 max-w-xs leading-relaxed mx-auto">
                      サービス詳細や料金プランなど、<br />
                      詳しい資料をお送りいたします。
                    </p>
                    <div className="inline-flex items-center gap-2 border border-white/50 px-6 py-3 group-hover:bg-white/10 transition-all duration-300">
                      <span className="text-sm tracking-wider">VIEW MORE</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* お問い合わせ */}
            <Link
              href="/contact"
              className="group relative block overflow-hidden"
            >
              <div className="relative h-[320px] md:h-[400px]">
                {/* 背景画像 */}
                <Image
                  src="/images/cta/contact.jpg"
                  alt="お問い合わせ"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* オーバーレイ */}
                <div className="absolute inset-0 bg-black/60" />
                
                {/* コンテンツ */}
                <div className="absolute inset-0 flex items-center justify-center text-white text-center px-6">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                      CONTACT
                    </h3>
                    <p className="text-lg font-medium mb-4">お問い合わせ</p>
                    <p className="text-sm text-gray-200 mb-8 max-w-xs leading-relaxed mx-auto">
                      ご質問・ご相談について、<br />
                      まずはお気軽にお問合せください。
                    </p>
                    <div className="inline-flex items-center gap-2 border border-white/50 px-6 py-3 group-hover:bg-white/10 transition-all duration-300">
                      <span className="text-sm tracking-wider">VIEW MORE</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </ScrollAnimation>
      </section>

    </div>
  )
}