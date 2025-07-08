'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import { Project } from '@/app/types'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProjectCardProps {
  project: Project
  onOpenDetail?: (project: Project) => void
  priority?: boolean
}

const ProjectCard = ({ project, onOpenDetail, priority = false }: ProjectCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()
  const categoryColors = {
    'homepage': 'bg-purple-600',
    'landing-page': 'bg-pink-600',
    'web-app': 'bg-blue-600',
    'mobile-app': 'bg-green-600'
  }

  const categoryLabels = {
    'homepage': 'ホームページ',
    'landing-page': 'ランディングページ',
    'web-app': 'Webアプリ',
    'mobile-app': 'モバイルアプリ'
  }

  const handleCardClick = () => {
    router.push(`/projects/${project.id}`)
  }

  return (
    <div 
      className="video-card group cursor-pointer hover:scale-105 transition-transform duration-200"
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
      <div className="relative">
        <div className="aspect-video relative overflow-hidden">
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
        <div className={`absolute top-1 sm:top-2 right-1 sm:right-2 ${categoryColors[project.category]} text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded`}>
          {categoryLabels[project.category]}
        </div>
        {project.featured && (
          <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-blue-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            Featured
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6">
          <div
            className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-black font-medium text-sm">View Details</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </div>
        </div>
      </div>
      
      <div className="p-2.5 sm:p-3">
        <div className="flex-1 min-w-0">
            <h3 className="font-medium text-xs sm:text-sm leading-4 sm:leading-5 line-clamp-2 mb-1 group-hover:text-white transition-colors">
              {project.title}
            </h3>
            
            <div className="mb-2">
              <p className={`text-[11px] sm:text-xs text-muted-foreground ${!isExpanded ? 'line-clamp-2' : ''}`}>
                {project.description}
              </p>
              {project.description.length > 100 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(!isExpanded)
                  }}
                  className="text-[11px] sm:text-xs text-blue-400 hover:text-blue-300 mt-1 flex items-center gap-0.5 sm:gap-1"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      閉じる
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      もっと見る
                    </>
                  )}
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-0.5 sm:gap-1 mb-1.5 sm:mb-2">
              {project.technologies.slice(0, 3).map((tech) => (
                <span key={tech} className="text-[10px] sm:text-xs bg-youtube-gray px-1.5 sm:px-2 py-0.5 rounded">
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-0.5 sm:gap-1 text-[11px] sm:text-xs text-muted-foreground">
              <Clock className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
              <span className="hidden sm:inline">開発期間: </span>
              <span>{project.duration}</span>
            </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard