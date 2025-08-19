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
      <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">開発実績一覧</h1>
      
      {/* Category Tabs */}
      <div className="mb-6 sm:mb-8 -mx-4 sm:-mx-6 lg:mx-0">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-4 sm:px-6 lg:px-0 pb-2 lg:pb-0 lg:flex-wrap">
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.label}
                <span className="ml-1.5 sm:ml-2 text-xs">
                  ({categoryCounts[category.id]})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FolderOpen className="h-16 w-16 sm:h-24 sm:w-24 text-gray-400 mb-4" />
          <p className="text-lg sm:text-xl text-gray-500">このカテゴリにプロジェクトはありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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