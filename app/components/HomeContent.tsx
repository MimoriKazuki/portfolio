'use client'

import ProjectCard from './ProjectCard'
import ProfileCard from './ProfileCard'
import { HeroSection } from './ui/light-saas-hero-section'
import { AIServicesCarousel } from './ui/ai-services-carousel'
import { ArrowRight, FolderOpen, FileText, Calendar, Bell, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Project, Column, Notice } from '@/app/types'

interface HomeContentProps {
  profiles: any
  categoryStats: {
    'homepage': number
    'landing-page': number
    'web-app': number
    'mobile-app': number
    'video': number
  }
  featuredProjects: Project[]
  latestColumns: Column[]
  latestNotices?: Notice[]
}

export default function HomeContent({ profiles, categoryStats, featuredProjects, latestColumns, latestNotices }: HomeContentProps) {
  return (
      <div className="w-full">
        {/* SEO用の非表示h1 */}
        <h1 className="sr-only">LandBridge株式会社 - AI人材育成サービスとAI制作実績</h1>
        
        {/* Hero Section - 画面いっぱい */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8">
          <HeroSection />
        </div>

        <div className="max-w-[1023px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* AI Human Resource Development Services - Carousel */}
        <div>
          <AIServicesCarousel 
            titleSize="text-2xl font-bold"
            sectionPadding="pt-16 pb-16"
          />
        </div>

        {/* Latest Notices */}
        {latestNotices && latestNotices.length > 0 && (
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
            
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
              {latestNotices.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/notices/${notice.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-portfolio-blue transition-colors mb-2">
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
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-portfolio-blue transition-colors ml-4" />
                  </div>
                </Link>
              ))}
            </div>
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
          
          {featuredProjects.length === 0 ? (
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
                  priority={index < 3} // 最初の3枚を優先読み込み
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
          
          {latestColumns.length === 0 ? (
            <div className="bg-gray-100 rounded-lg p-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl text-gray-500">まだコラムがありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {latestColumns.map((column) => (
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
      </div>
  )
}