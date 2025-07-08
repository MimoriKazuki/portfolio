'use client'

import ProjectCard from './ProjectCard'
import ProfileCard from './ProfileCard'
import { ArrowRight, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { Project } from '@/app/types'

interface HomeContentProps {
  profiles: any
  categoryStats: {
    'homepage': number
    'landing-page': number
    'web-app': number
    'mobile-app': number
  }
  featuredProjects: Project[]
}

export default function HomeContent({ profiles, categoryStats, featuredProjects }: HomeContentProps) {
  return (
      <div className="p-4 sm:p-6 pt-2 sm:pt-3">
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
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
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
        
        {/* 問い合わせボタンとの重なりを防ぐためのスペース */}
        <div className="h-24" />
      </div>
  )
}