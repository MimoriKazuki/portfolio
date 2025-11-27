'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Project } from '@/app/types'
import { useRouter } from 'next/navigation'

interface ProjectCardProps {
  project: Project
  onOpenDetail?: (project: Project) => void
  priority?: boolean
}

const ProjectCard = ({ project, onOpenDetail, priority = false }: ProjectCardProps) => {
  const router = useRouter()
  const categoryColors = {
    'homepage': 'border-purple-200 text-purple-700',
    'landing-page': 'border-pink-200 text-pink-700',
    'web-app': 'border-blue-200 text-blue-700',
    'mobile-app': 'border-green-200 text-green-700',
    'video': 'border-orange-200 text-orange-700'
  }

  const categoryLabels = {
    'homepage': 'ホームページ',
    'landing-page': 'ランディングページ',
    'web-app': 'Webアプリ',
    'mobile-app': 'モバイルアプリ',
    'video': '動画制作'
  }

  const handleCardClick = () => {
    router.push(`/projects/${project.id}`)
  }

  return (
    <div 
      className="overflow-hidden border-2 border-transparent hover:border-gray-200 transition-colors duration-300 group cursor-pointer h-full flex flex-col w-full p-4 rounded"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick()
        }
      }}
      title="クリックして詳細を見る"
    >
      {/* 画像 */}
      <div className="relative">
        <div className="aspect-video relative overflow-hidden rounded">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>
      </div>
      
      {/* テキスト群 */}
      <div className="pt-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
          {project.title}
        </h3>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
          {project.description}
        </p>
        
        <div className="min-h-[24px] mb-3">
          {project.technologies && project.technologies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 3).map((tech) => (
                <span key={tech} className="text-xs text-gray-600 px-2 py-0.5 border border-gray-200">
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>
          ) : (
            <div className="h-full"></div>
          )}
        </div>
        
        {/* 開発時間とカテゴリバッジ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
          <span>{project.duration}</span>
          </div>
          <span className={`${categoryColors[project.category]} bg-white text-xs px-3 py-1 border font-medium`}>
            {categoryLabels[project.category]}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard