'use client'

import { useState, useMemo } from 'react'
import ProjectCard from '@/app/components/ProjectCard'
import { FolderOpen } from 'lucide-react'
import { Project } from '@/app/types'

const categories = [
  { id: 'all', label: 'すべて' },
  { id: 'homepage', label: 'ホームページ' },
  { id: 'landing-page', label: 'ランディングページ' },
  { id: 'web-app', label: 'Webアプリ' },
  { id: 'mobile-app', label: 'モバイルアプリ' },
]

interface ProjectsClientProps {
  projects: Project[]
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  
  // フィルタリングをメモ化
  const filteredProjects = useMemo(() => {
    return activeCategory === 'all' 
      ? projects 
      : projects.filter(project => project.category === activeCategory)
  }, [activeCategory, projects])
    
  return (
      <div className="p-4 sm:p-6 pt-2 sm:pt-3">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">開発実績一覧</h1>
      
      {/* Category Tabs */}
      <div className="mb-6 -mx-6 sm:mx-0 relative">
        <div className="flex gap-2 px-6 sm:px-0 overflow-x-auto scrollbar-hide sm:flex-wrap">
          {/* モバイルでのスクロールインジケーター */}
          <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-youtube-dark to-transparent pointer-events-none sm:hidden" />
          <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-youtube-dark to-transparent pointer-events-none sm:hidden" />
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-youtube-gray text-muted-foreground hover:bg-blue-600/10 hover:text-blue-400'
              }`}
            >
              {category.label}
              <span className="ml-1.5 sm:ml-2 text-xs">
                {category.id === 'all' 
                  ? projects.length 
                  : projects.filter(p => p.category === category.id).length
                }
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FolderOpen className="h-24 w-24 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">No projects in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
            />
          ))}
        </div>
      )}
        
        {/* 問い合わせボタンとの重なりを防ぐためのスペース */}
        <div className="h-24" />
      </div>
  )
}