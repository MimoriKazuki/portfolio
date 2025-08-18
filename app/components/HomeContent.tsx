'use client'

import ProjectCard from './ProjectCard'
import ProfileCard from './ProfileCard'
import { ArrowRight, FolderOpen, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Project, Column } from '@/app/types'

interface HomeContentProps {
  profiles: any
  categoryStats: {
    'homepage': number
    'landing-page': number
    'web-app': number
    'mobile-app': number
  }
  featuredProjects: Project[]
  latestColumns: Column[]
}

export default function HomeContent({ profiles, categoryStats, featuredProjects, latestColumns }: HomeContentProps) {
  return (
      <div className="w-full">
        {/* SEO用の非表示h1 */}
        <h1 className="sr-only">LandBridge株式会社 - AIによる自動コーディングを活用した開発実績</h1>
        
        {/* Profile Card */}
        <ProfileCard profile={profiles} categoryStats={categoryStats} />

        {/* Featured Projects */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">注目のプロジェクト</h2>
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
        <section className="mb-8">
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
                  href={`/columns/${column.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    {column.thumbnail && (
                      <div className="relative aspect-video">
                        <Image
                          src={column.thumbnail}
                          alt={column.title}
                          fill
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
                          {new Date(column.published_date).toLocaleDateString('ja-JP')}
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