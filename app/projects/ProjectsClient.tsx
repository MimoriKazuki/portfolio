'use client'

import { useState, useMemo, useEffect } from 'react'
import ProjectCard from '@/app/components/ProjectCard'
import { FolderOpen } from 'lucide-react'
import { Project } from '@/app/types'

const categories = [
  { id: 'all', label: 'すべて' },
  { id: 'homepage', label: 'ホームページ' },
  { id: 'landing-page', label: 'ランディングページ' },
  { id: 'web-app', label: 'Webアプリ' },
  { id: 'mobile-app', label: 'モバイルアプリ' },
  { id: 'video', label: '動画制作' },
]

interface ProjectsClientProps {
  projects: Project[]
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])
  
  // カテゴリごとのプロジェクト数を計算
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    categories.forEach(category => {
      if (category.id === 'all') {
        counts[category.id] = projects.length
      } else {
        counts[category.id] = projects.filter(p => p.category === category.id).length
      }
    })
    return counts
  }, [projects])
  
  // コンテンツがあるカテゴリのみをフィルタリング
  const visibleCategories = useMemo(() => {
    return categories.filter(category => 
      category.id === 'all' || categoryCounts[category.id] > 0
    )
  }, [categoryCounts])
  
  // フィルタリングをメモ化
  const filteredProjects = useMemo(() => {
    return activeCategory === 'all' 
      ? projects 
      : projects.filter(project => project.category === activeCategory)
  }, [activeCategory, projects])
    
  return (
    <div className="w-full pt-8">
      <div
        className="mb-12"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">PORTFOLIO</h1>
        <p className="text-lg text-gray-500">制作実績</p>
      </div>
      
      {/* Category Tabs */}
      <div className="mb-6 relative">
        <div className="absolute inset-x-0 -mx-4 sm:-mx-6 lg:static lg:mx-0">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex px-4 sm:px-6 lg:px-0 border-b border-gray-200">
              {visibleCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap relative ${
                    activeCategory === category.id
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {category.label}
                  {activeCategory === category.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* スペーサー */}
        <div className="h-12 lg:hidden" />
      </div>
      
      {/* カードコンテナ */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FolderOpen className="h-16 w-16 sm:h-24 sm:w-24 text-gray-400 mb-4" />
          <p className="text-lg sm:text-xl text-gray-500">このカテゴリにプロジェクトはありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProjects.map((project) => (
            <div key={project.id}>
              <ProjectCard 
                project={project} 
              />
            </div>
          ))}
        </div>
      )}
        
      {/* 問い合わせボタンとの重なりを防ぐためのスペース */}
      <div className="h-24" />
    </div>
  )
}